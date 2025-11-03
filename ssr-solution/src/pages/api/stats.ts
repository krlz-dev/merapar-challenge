import type { APIRoute } from 'astro';
import { sseService } from '../../services/sse-service.js';

export const GET: APIRoute = async () => {
  try {
    const stats = sseService.getStats();
    
    return new Response(JSON.stringify(stats), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};