import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';

const clients = new Set<WritableStreamDefaultWriter>();

// Function to broadcast updates to all connected clients
export function broadcastUpdate(data: string) {
  const message = `data: ${JSON.stringify({ dynamicString: data })}\n\n`;
  
  clients.forEach(async (writer) => {
    try {
      await writer.write(new TextEncoder().encode(message));
    } catch (error) {
      console.error('Error writing to SSE client:', error);
      clients.delete(writer);
    }
  });
}

export const GET: APIRoute = async () => {
  const stream = new ReadableStream({
    start(controller) {
      const writer = controller;
      
      // Add client to the set
      const encoder = new TextEncoder();
      
      // Send initial connection message
      const initialMessage = `data: ${JSON.stringify({ type: 'connected' })}\n\n`;
      controller.enqueue(encoder.encode(initialMessage));
      
      // Send current text value
      try {
        const dataPath = path.join(process.cwd(), 'src/data/text.json');
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
        const currentMessage = `data: ${JSON.stringify({ dynamicString: data.dynamicString || 'default dynamic string' })}\n\n`;
        controller.enqueue(encoder.encode(currentMessage));
      } catch (error) {
        console.error('Error reading initial text:', error);
      }
      
      // Create a custom writer that wraps the controller
      const customWriter = {
        write: async (chunk: Uint8Array) => {
          try {
            controller.enqueue(chunk);
          } catch (error) {
            console.error('Error writing to stream:', error);
            clients.delete(customWriter as any);
          }
        }
      } as WritableStreamDefaultWriter;
      
      clients.add(customWriter);
      
      // Handle cleanup when client disconnects
      const cleanup = () => {
        clients.delete(customWriter);
      };
      
      // Store cleanup function for later use
      (customWriter as any).cleanup = cleanup;
    },
    
    cancel() {
      // Client disconnected, clean up
      console.log('SSE client disconnected');
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