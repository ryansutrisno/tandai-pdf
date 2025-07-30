
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return new NextResponse('URL parameter is missing', { status: 400 });
  }

  try {
    const response = await fetch(url, {
        headers: {
            // Attempt to mimic a browser request to get past simple anti-bot measures
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
    });

    if (!response.ok) {
        // Pass through the error status and message from the target server
        return new NextResponse(response.statusText, { status: response.status });
    }

    const body = await response.blob();
    const headers = new Headers(response.headers);
    // Ensure the browser can read the response
    headers.set('Access-Control-Allow-Origin', '*'); 

    return new NextResponse(body, {
      status: 200,
      headers: headers,
    });
  } catch (error) {
    console.error(`CORS Proxy Error for URL: ${url}`, error);
    if (error instanceof TypeError && error.message.includes('fetch failed')) {
        return new NextResponse(`Failed to fetch the URL. It might be down or blocking requests.`, { status: 502 });
    }
    return new NextResponse('An internal error occurred in the proxy.', { status: 500 });
  }
}

    