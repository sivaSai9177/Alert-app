import { authMinimal } from "@/lib/auth/auth-minimal";

// Test handler with minimal auth configuration
async function handler(request: Request) {
// TODO: Replace with structured logging - console.log('[TEST AUTH] Request received:', request.url);
  
  try {
    const response = await authMinimal.handler(request);
// TODO: Replace with structured logging - console.log('[TEST AUTH] Response:', response.status);
    return response;
  } catch (error) {
    console.error('[TEST AUTH] Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

export { handler as GET, handler as POST };