import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  return handleProxy(request);
}

export async function POST(request: NextRequest) {
  return handleProxy(request);
}

export async function PUT(request: NextRequest) {
  return handleProxy(request);
}

export async function DELETE(request: NextRequest) {
  return handleProxy(request);
}

async function handleProxy(request: NextRequest) {
  const backendUrl = process.env.BACKEND_URL || 'http://localhost:62001';
  
  const url = new URL(request.url);
  const targetUrl = `${backendUrl}${url.pathname}${url.search}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'host') {
      headers.set(key, value);
    }
  });

  let body: any = undefined;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    body = await request.blob();
  }

  try {
    const res = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      cache: 'no-store'
    });

    const responseHeaders = new Headers();
    res.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      if (
        lowerKey !== 'content-encoding' &&
        lowerKey !== 'content-length' &&
        lowerKey !== 'transfer-encoding'
      ) {
        responseHeaders.set(key, value);
      }
    });

    const textData = await res.text();

    return new NextResponse(textData, {
      status: res.status,
      headers: responseHeaders,
    });
  } catch (err: any) {
    console.error(`Proxy error for ${targetUrl}:`, err);
    return NextResponse.json({ error: 'Proxy failed', message: err.message }, { status: 500 });
  }
}
