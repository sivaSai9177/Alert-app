#!/usr/bin/env bun
/**
 * Check current user status in the database
 */

import { db } from '../src/db';
import { user as userTable } from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function checkUserStatus() {
// TODO: Replace with structured logging - console.log('🔍 Checking user status in database...\n');

  try {
    // Get all users
    const users = await db
      .select({
        id: userTable.id,
        email: userTable.email,
        name: userTable.name,
        role: userTable.role,
        needsProfileCompletion: userTable.needsProfileCompletion,
        emailVerified: userTable.emailVerified,
        createdAt: userTable.createdAt,
        updatedAt: userTable.updatedAt,
      })
      .from(userTable);

// TODO: Replace with structured logging - console.log(`📋 Found ${users.length} users:\n`);
    
    users.forEach((user, index) => {
// TODO: Replace with structured logging - console.log(`👤 User ${index + 1}:`);
// TODO: Replace with structured logging - console.log(`   Email: ${user.email}`);
// TODO: Replace with structured logging - console.log(`   Name: ${user.name}`);
// TODO: Replace with structured logging - console.log(`   Role: ${user.role || 'null'}`);
// TODO: Replace with structured logging - console.log(`   Needs Profile Completion: ${user.needsProfileCompletion}`);
// TODO: Replace with structured logging - console.log(`   Email Verified: ${user.emailVerified}`);
// TODO: Replace with structured logging - console.log(`   Created: ${user.createdAt}`);
// TODO: Replace with structured logging - console.log(`   Updated: ${user.updatedAt}`);
      
      // Status assessment
      if (user.needsProfileCompletion) {
// TODO: Replace with structured logging - console.log(`   ✅ Status: Will be prompted for profile completion`);
      } else if (user.role && user.role !== 'guest') {
// TODO: Replace with structured logging - console.log(`   ✅ Status: Profile complete, has role "${user.role}"`);
      } else {
// TODO: Replace with structured logging - console.log(`   ⚠️  Status: Unclear - might need manual fix`);
      }
// TODO: Replace with structured logging - console.log('');
    });

    // Check specific user if provided
    const targetEmail = process.argv[2];
    if (targetEmail) {
// TODO: Replace with structured logging - console.log(`\n🔍 Detailed check for ${targetEmail}:`);
      
      const [specificUser] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.email, targetEmail))
        .limit(1);

      if (specificUser) {
// TODO: Replace with structured logging - console.log('📊 Full user data:', JSON.stringify(specificUser, null, 2));
      } else {
// TODO: Replace with structured logging - console.log('❌ User not found');
      }
    }

  } catch (error) {
    console.error('❌ Error checking user status:', error);
    process.exit(1);
  }
}

// Run the check
checkUserStatus()
  .then(() => {
// TODO: Replace with structured logging - console.log('\n✅ User status check completed!');
// TODO: Replace with structured logging - console.log('\n💡 To check a specific user: bun run scripts/check-user-status.ts user@example.com');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ User status check failed:', error);
    process.exit(1);
  });