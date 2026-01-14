// Health check endpoint for auth API
export async function GET() {
  return new Response(JSON.stringify({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      hasGoogleId: !!process.env.GOOGLE_CLIENT_ID,
      hasGoogleSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      hasBetterAuthSecret: !!process.env.BETTER_AUTH_SECRET,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
    }
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}