import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';
import { broadcastUpdate } from '../../services/sse-service.js';

export const POST: APIRoute = async ({ request }) => {
  try {
    let body;
    let text;
    
    try {
      const rawBody = await request.text();
      console.log('Raw body:', rawBody);
      body = JSON.parse(rawBody);
      text = body.text;
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return new Response(JSON.stringify({ error: 'Invalid JSON format' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid text provided' }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    const dataPath = path.join(process.cwd(), 'src/data/text.json');
    const data = { dynamicString: text };
    
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    broadcastUpdate(text);

    return new Response(JSON.stringify({ success: true, message: 'Text updated successfully' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Error updating text:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};