export function corsHeaders(origin) {
  // Allow all origins in development, or specific origin if provided
  const allowedOrigin = origin || '*';
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };
}

export function handleCors(request) {
  const origin = request.headers.get('origin') || '*';
  
  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders(origin),
    });
  }
  
  return corsHeaders(origin);
}