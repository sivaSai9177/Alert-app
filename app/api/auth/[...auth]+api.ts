import { auth } from "@/lib/auth/auth";
import { log } from "@/lib/core/logger";

// Simple Better Auth handler with proper CORS
async function handler(request: Request) {
  const origin = request.headers.get('origin') || '*';
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie, X-Requested-With, x-trpc-source',
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
    // Debug logging
    log.debug('[AUTH API] Request received', 'AUTH_API', {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
    });
    
    // Log request body if POST
    if (request.method === 'POST' && request.headers.get('content-type')?.includes('application/json')) {
      try {
        const clonedRequest = request.clone();
        const bodyText = await clonedRequest.text();
        log.debug('[AUTH API] Raw request body', 'AUTH_API', { bodyText });
        
        try {
          const bodyJson = JSON.parse(bodyText);
          log.debug('[AUTH API] Parsed request body', 'AUTH_API', bodyJson);
        } catch (parseError) {
          log.debug('[AUTH API] Could not parse body as JSON', 'AUTH_API', { error: (parseError as Error).message });
        }
      } catch (e) {
        log.debug('[AUTH API] Could not read request body', 'AUTH_API', e);
      }
    }
    
    // Check if auth handler exists
    if (!auth || typeof auth.handler !== 'function') {
      log.error('[AUTH API ERROR]: auth.handler is not a function', 'AUTH_API', {
        authExists: !!auth,
        handlerType: typeof auth?.handler
      });
      return new Response(
        JSON.stringify({ error: 'Auth handler not properly initialized' }), 
        {
          status: 500,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }
    
    // Parse URL to check the path
    const url = new URL(request.url);
    
    // Check if this is a mobile OAuth callback for Google
    const userAgent = request.headers.get('user-agent') || '';
    const referer = request.headers.get('referer') || '';
    const isMobileOAuth = url.pathname.includes('/callback/google') && 
                          (userAgent.includes('Expo') || userAgent.includes('okhttp') || 
                           userAgent.includes('Android') || userAgent.includes('iPhone') ||
                           referer.includes('auth.expo.io'));
    
    if (isMobileOAuth && request.method === 'GET') {
      // Handle mobile OAuth callback specially
      
      // Call Better Auth handler first to process the OAuth
      const authResponse = await auth.handler(request);
      
      if (authResponse.status >= 200 && authResponse.status < 400) {
        // OAuth was successful, return mobile-friendly response
        
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
    log.debug('[AUTH API] Calling auth.handler...', 'AUTH_API');
    const response = await auth.handler(request);
    log.debug('[AUTH API] Response from auth.handler', 'AUTH_API', { status: response.status });
    
    // Response handled by Better Auth
    
    // Add CORS headers to response
    Object.entries(corsHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  } catch (error) {
    log.error('[AUTH API ERROR]', 'AUTH_API', error);
    log.error('[AUTH API ERROR] Full error', 'AUTH_API', {
      message: (error as Error).message,
      stack: (error as Error).stack,
      name: (error as Error).name,
    });
    
    // Return more detailed error in development
    const errorMessage = process.env.NODE_ENV === 'development' 
      ? (error as Error).message || 'Internal Server Error'
      : 'Internal Server Error';
    
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? (error as Error).stack : undefined
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