import { db } from '@/src/db';
import { user } from '@/src/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  if (process.env.NODE_ENV !== 'development') {
    return Response.json({ error: 'Debug endpoint only available in development' }, { status: 403 });
  }

  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return Response.json({ error: 'Email parameter required' }, { status: 400 });
    }

    const [userRecord] = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);

    if (!userRecord) {
      return Response.json({ 
        found: false, 
        message: `User with email ${email} not found` 
      });
    }

    return Response.json({
      found: true,
      user: {
        id: userRecord.id,
        email: userRecord.email,
        name: userRecord.name,
        role: userRecord.role,
        needsProfileCompletion: userRecord.needsProfileCompletion,
        createdAt: userRecord.createdAt,
        organizationId: userRecord.organizationId,
        phoneNumber: userRecord.phoneNumber,
        department: userRecord.department,
        organizationName: userRecord.organizationName,
        jobTitle: userRecord.jobTitle,
        bio: userRecord.bio,
      }
    });
  } catch (error) {
    console.error('[DEBUG] Error fetching user:', error);
    return Response.json({ 
      error: 'Failed to fetch user',
      details: error.message 
    }, { status: 500 });
  }
}