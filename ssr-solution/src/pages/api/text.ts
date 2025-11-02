import type { APIRoute } from 'astro';
import fs from 'fs';
import path from 'path';

export const GET: APIRoute = async () => {
  try {
    const dataPath = path.join(process.cwd(), 'src/data/text.json');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    console.error('Error reading text data:', error);
    return new Response(JSON.stringify({ 
      error: 'Unable to read text data',
      dynamicString: 'default dynamic string' 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};