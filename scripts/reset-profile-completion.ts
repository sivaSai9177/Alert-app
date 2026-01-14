import 'dotenv/config';
import { db } from '../src/db';
import { user } from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function resetProfileCompletion(email: string) {
  try {
// TODO: Replace with structured logging - console.log(`🔄 Resetting profile completion for: ${email}`);
    
    const result = await db
      .update(user)
      .set({ 
        needsProfileCompletion: true,
        // Optionally clear some profile fields to test the flow
        phoneNumber: null,
        department: null,
        organizationName: null,
        jobTitle: null,
        bio: null,
      })
      .where(eq(user.email, email))
      .returning();
    
    if (result.length > 0) {
// TODO: Replace with structured logging - console.log('✅ Profile reset successful!');
// TODO: Replace with structured logging - console.log('📝 User will now see profile completion screen on next login');
// TODO: Replace with structured logging - console.log('🔧 Cleared fields: phoneNumber, department, organizationName, jobTitle, bio');
    } else {
// TODO: Replace with structured logging - console.log('❌ User not found with email:', email);
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
// TODO: Replace with structured logging - console.log('📖 Usage: bun run reset-profile <email>');
// TODO: Replace with structured logging - console.log('📖 Example: bun run reset-profile sirigirisiva1@gmail.com');
  process.exit(1);
}

resetProfileCompletion(email);