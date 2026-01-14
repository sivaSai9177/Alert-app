import 'dotenv/config';
import { db } from '../src/db';
import { user, account, session } from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function deleteUser(email: string) {
  try {
// TODO: Replace with structured logging - console.log(`🗑️  Deleting user and all related data for: ${email}`);
    
    // Find user first
    const [userToDelete] = await db
      .select()
      .from(user)
      .where(eq(user.email, email))
      .limit(1);
    
    if (!userToDelete) {
// TODO: Replace with structured logging - console.log('❌ User not found with email:', email);
      process.exit(1);
    }
    
// TODO: Replace with structured logging - console.log(`👤 Found user: ${userToDelete.id}`);
    
    // Delete in order: sessions, accounts, then user
    const deletedSessions = await db
      .delete(session)
      .where(eq(session.userId, userToDelete.id))
      .returning();
    
    const deletedAccounts = await db
      .delete(account)
      .where(eq(account.userId, userToDelete.id))
      .returning();
    
    const deletedUsers = await db
      .delete(user)
      .where(eq(user.id, userToDelete.id))
      .returning();
    
// TODO: Replace with structured logging - console.log('✅ User deletion successful!');
// TODO: Replace with structured logging - console.log(`🗂️  Deleted: ${deletedSessions.length} sessions, ${deletedAccounts.length} accounts, ${deletedUsers.length} user`);
// TODO: Replace with structured logging - console.log('🔄 User can now be recreated via OAuth as a new user');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
// TODO: Replace with structured logging - console.log('📖 Usage: bun run delete-user <email>');
// TODO: Replace with structured logging - console.log('📖 Example: bun run delete-user sirigirisiva1@gmail.com');
  process.exit(1);
}

deleteUser(email);