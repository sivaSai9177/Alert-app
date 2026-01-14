// Ultra-simple test without any database
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (body.provider === 'google') {
      // Mock OAuth response
      return new Response(JSON.stringify({
        url: `https://accounts.google.com/o/oauth2/auth?response_type=code&client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${encodeURIComponent(body.callbackURL)}`,
        redirect: true,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    return new Response(JSON.stringify({ error: 'Invalid provider' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ 
      error: error.message,
      type: 'simple-handler'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}