import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import { sseService, type SSEClient } from '@/services/sse-service.ts';

export const GET: APIRoute = async () => {
  let client: SSEClient;
  
  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const initialMessage = `data: ${JSON.stringify({ type: 'connected' })}\n\n`;
      controller.enqueue(encoder.encode(initialMessage));

      try {
        const dataPath = path.join(process.cwd(), 'src/data/text.json');
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        const currentMessage = `data: ${JSON.stringify({ dynamicString: data.dynamicString || 'default dynamic string' })}\n\n`;
        controller.enqueue(encoder.encode(currentMessage));
      } catch (error) {
        console.error('Error reading initial text:', error);
      }

      client = sseService.addClient(controller);
    },
    
    cancel() {
      console.log('SSE stream cancelled');
      if (client) {
        client.cleanup();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  });
};

