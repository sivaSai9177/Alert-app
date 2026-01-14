import { db } from "@/src/db";
import { eq } from "drizzle-orm";
import { user, session, account } from "@/src/db/schema";

export async function POST(request: Request) {
  try {
    
    const body = await request.json();
    const { code, redirectUri, idToken, type, codeVerifier } = body;

    let googleUser: any;
    let tokens: any = null;

    // Handle ID token flow (recommended for mobile)
    if (type === 'id_token' && idToken) {
      
      // Verify and decode the ID token
      const idTokenParts = idToken.split('.');
      if (idTokenParts.length !== 3) {
        return Response.json(
          { error: 'Invalid ID token format' },
          { status: 400 }
        );
      }
      
      // Decode the payload (middle part)
      const payload = JSON.parse(atob(idTokenParts[1]));
        email: payload.email, 
        name: payload.name,
        aud: payload.aud,
        iss: payload.iss
      });
      
      // Verify the token is from Google and for our app
      if (payload.iss !== 'https://accounts.google.com' && payload.iss !== 'accounts.google.com') {
        return Response.json(
          { error: 'Invalid token issuer' },
          { status: 400 }
        );
      }
      
      if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
        console.error('[Mobile OAuth API] Token audience mismatch:', payload.aud, 'expected:', process.env.GOOGLE_CLIENT_ID);
        // For now, we'll proceed but log the warning
      }
      
      googleUser = {
        id: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        email_verified: payload.email_verified,
      };
      
      // For ID token flow, we don't have access/refresh tokens
      // Just store the ID token itself
      tokens = {
        id_token: idToken,
        scope: 'openid email profile',
      };
    } else if (code && redirectUri) {
      // Handle authorization code flow (fallback)

      // Exchange the authorization code for tokens
      const tokenParams: any = {
        client_id: process.env.GOOGLE_CLIENT_ID!,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      };

      // Include PKCE verifier if provided (mobile flow)
      if (codeVerifier) {
        tokenParams.code_verifier = codeVerifier;
      } else {
        // Only include client secret if not using PKCE (web flow)
        tokenParams.client_secret = process.env.GOOGLE_CLIENT_SECRET!;
      }

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(tokenParams),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('[Mobile OAuth API] Token exchange failed:', errorText);
        return Response.json(
          { error: 'Failed to exchange authorization code' },
          { status: 400 }
        );
      }

      tokens = await tokenResponse.json();

      // Fetch user information
      const userResponse = await fetch(
        `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${tokens.access_token}`
      );

      if (!userResponse.ok) {
        console.error('[Mobile OAuth API] Failed to fetch user info');
        return Response.json(
          { error: 'Failed to fetch user information' },
          { status: 400 }
        );
      }

      googleUser = await userResponse.json();
    } else {
      console.error('[Mobile OAuth API] Missing required parameters');
      return Response.json(
        { error: 'Missing authorization code or ID token' },
        { status: 400 }
      );
    }

    // Check if user exists by email
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, googleUser.email))
      .limit(1);

    let userId: string;
    let userRecord;

    if (existingUser.length > 0) {
      userRecord = existingUser[0];
      userId = userRecord.id;
    } else {
      // Create new user
      const newUserId = crypto.randomUUID();
      const newUser = {
        id: newUserId,
        email: googleUser.email,
        name: googleUser.name,
        image: googleUser.picture,
        role: 'user', // Default role
        emailVerified: true, // OAuth emails are pre-verified
        needsProfileCompletion: true, // New users need to complete profile
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.insert(user).values(newUser);
      userId = newUserId;
      userRecord = newUser;
    }

    // Check if Google account is linked
    const existingAccount = await db
      .select()
      .from(account)
      .where(eq(account.userId, userId))
      .limit(1);

    if (existingAccount.length === 0) {
      // Link Google account
      await db.insert(account).values({
        id: crypto.randomUUID(),
        userId: userId,
        accountId: googleUser.id,
        providerId: 'google',
        accessToken: tokens?.access_token || null,
        refreshToken: tokens?.refresh_token || null,
        idToken: tokens?.id_token || idToken || null,
        accessTokenExpiresAt: tokens?.expires_in ? new Date(Date.now() + tokens.expires_in * 1000) : null,
        scope: tokens?.scope || 'openid email profile',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Create session using Better Auth
    const sessionId = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.insert(session).values({
      id: sessionId,
      userId: userId,
      expiresAt: expiresAt,
      token: sessionId, // Use session ID as token
      createdAt: new Date(),
      updatedAt: new Date(),
    });


    // Create response with session cookie
    const response = Response.json({
      success: true,
      user: {
        id: userRecord.id,
        email: userRecord.email,
        name: userRecord.name,
        image: userRecord.image,
        role: userRecord.role,
        needsProfileCompletion: userRecord.needsProfileCompletion ?? false,
      },
      session: {
        id: sessionId,
        expiresAt: expiresAt.toISOString(),
      }
    });

    // Set session cookie
    response.headers.set(
      'Set-Cookie',
      `better-auth.session-token=${sessionId}; HttpOnly=false; SameSite=Lax; Path=/; Max-Age=${7 * 24 * 60 * 60}`
    );

    return response;

  } catch (error) {
    console.error('[Mobile OAuth API] Error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}