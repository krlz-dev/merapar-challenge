import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import { sseService } from '@/services/sse-service.ts';

export const GET: APIRoute = async () => {
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

      const client = sseService.addClient(controller);
      
      return client;
    },
    
    cancel() {
      console.log('SSE stream cancelled');
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

