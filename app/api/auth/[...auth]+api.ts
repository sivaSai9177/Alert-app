import { auth } from "@/lib/auth";

// Simple Better Auth handler with proper CORS
async function handler(request: Request) {
  const origin = request.headers.get('origin');
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
  };

  // Handle preflight OPTIONS request
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    // Log incoming request
    console.log('[AUTH API] Request:', request.method, request.url);
    console.log('[AUTH API] Origin:', origin);
    
    // Parse URL to check the path
    const url = new URL(request.url);
    console.log('[AUTH API] Path:', url.pathname);
    console.log('[AUTH API] Search params:', url.searchParams.toString());
    
    // Log auth configuration
    console.log('[AUTH API] Social providers configured:', Object.keys(auth.options?.socialProviders || {}));
    
    // Check if this is a mobile OAuth callback for Google
    const userAgent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';
    const isMobileOAuth = url.pathname.includes('/callback/google') && 
                          (userAgent.includes('Expo') || userAgent.includes('okhttp') || 
                           userAgent.includes('Android') || userAgent.includes('iPhone') ||
                           referer.includes('auth.expo.io'));
    
    if (isMobileOAuth && request.method === 'GET') {
      console.log('[AUTH API] Detected mobile OAuth callback, handling specially');
      
      // Call Better Auth handler first to process the OAuth
      const authResponse = await auth.handler(request);
      
      if (authResponse.status >= 200 && authResponse.status < 400) {
        // OAuth was successful, return mobile-friendly response
        console.log('[AUTH API] OAuth successful, redirecting to app');
        
        return new Response(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Login Successful</title>
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                  text-align: center;
                  padding: 40px 20px;
                  background: #f8f9fa;
                  margin: 0;
                }
                .container {
                  background: white;
                  border-radius: 12px;
                  padding: 40px 20px;
                  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                  max-width: 400px;
                  margin: 0 auto;
                }
                h1 { color: #28a745; margin-bottom: 20px; font-size: 24px; }
                p { color: #666; margin-bottom: 20px; line-height: 1.5; }
                .success-icon { font-size: 48px; margin-bottom: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="success-icon">✅</div>
                <h1>Login Successful!</h1>
                <p>You have been successfully signed in with Google.</p>
                <p>You can now close this browser and return to the app.</p>
              </div>
              <script>
                // Auto-close after 3 seconds
                setTimeout(() => {
                  window.close();
                  // Try to redirect to the app
                  window.location.href = 'my-expo://home';
                }, 3000);
              </script>
            </body>
          </html>
        `, {
          headers: { 
            ...corsHeaders,
            'Content-Type': 'text/html' 
          },
        });
      } else {
        // OAuth failed
        return new Response(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Login Failed</title>
              <meta name="viewport" content="width=device-width, initial-scale=1">
              <style>
                body {
                  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                  text-align: center;
                  padding: 40px 20px;
                  background: #f8f9fa;
                  margin: 0;
                }
                .container {
                  background: white;
                  border-radius: 12px;
                  padding: 40px 20px;
                  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                  max-width: 400px;
                  margin: 0 auto;
                }
                h1 { color: #dc3545; margin-bottom: 20px; font-size: 24px; }
                p { color: #666; margin-bottom: 20px; line-height: 1.5; }
                .error-icon { font-size: 48px; margin-bottom: 20px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="error-icon">❌</div>
                <h1>Login Failed</h1>
                <p>There was an error during the sign-in process.</p>
                <p>Please try again.</p>
              </div>
              <script>
                setTimeout(() => {
                  window.close();
                }, 5000);
              </script>
            </body>
          </html>
        `, {
          headers: { 
            ...corsHeaders,
            'Content-Type': 'text/html' 
          },
          status: authResponse.status,
        });
      }
    }
    
    // Call Better Auth handler for normal requests
    const response = await auth.handler(request);
    
    // Log response details
    console.log('[AUTH API] Response status:', response.status);
    console.log('[AUTH API] Response headers:', Object.fromEntries(response.headers.entries()));
    
    // If it's an error response, log the body
    if (response.status >= 400) {
      const responseClone = response.clone();
      try {
        const errorBody = await responseClone.text();
        console.log('[AUTH API] Error response body:', errorBody);
      } catch (e) {
        console.log('[AUTH API] Could not read error body');
      }
    }
    
    // Add CORS headers to response
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    console.error('[AUTH API] Error:', error);
    console.error('[AUTH API] Error stack:', error.stack);
    console.error('[AUTH API] Request URL:', request.url);
    console.error('[AUTH API] Request method:', request.method);
    
    // Return more detailed error in development
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? error.message || 'Internal Server Error'
      : 'Internal Server Error';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }), 
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

export { handler as GET, handler as POST, handler as PUT, handler as DELETE, handler as OPTIONS };