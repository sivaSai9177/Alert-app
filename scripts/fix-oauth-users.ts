#!/usr/bin/env tsx
/**
 * Fix OAuth users who were created without needsProfileCompletion flag
 * This script identifies OAuth users who should complete their profile
 */

import { db } from '../src/db';
import { user as userTable } from '../src/db/schema';
import { eq, and, isNull, or } from 'drizzle-orm';

async function fixOAuthUsers() {
// TODO: Replace with structured logging - console.log('🔍 Finding OAuth users who need profile completion...');

  try {
    // Find users who are likely OAuth users that skipped profile completion
    // Criteria: no role set, or role is 'guest', and needsProfileCompletion is null/false
    const usersToFix = await db
      .select()
      .from(userTable)
      .where(
        and(
          or(
            isNull(userTable.role),
            eq(userTable.role, 'guest'),
            eq(userTable.role, 'user') // Even regular users might need profile completion
          ),
          or(
            isNull(userTable.needsProfileCompletion),
            eq(userTable.needsProfileCompletion, false)
          ),
          // Only fix users created via OAuth (they usually have emailVerified = true)
          eq(userTable.emailVerified, true)
        )
      );

// TODO: Replace with structured logging - console.log(`📋 Found ${usersToFix.length} users to potentially fix:`);
    
    for (const user of usersToFix) {
// TODO: Replace with structured logging - console.log(`  - ${user.email} (role: ${user.role || 'null'}, needsProfileCompletion: ${user.needsProfileCompletion})`);
    }

    if (usersToFix.length === 0) {
// TODO: Replace with structured logging - console.log('✅ No users need fixing!');
      return;
    }

// TODO: Replace with structured logging - console.log('\n🔧 Updating users to require profile completion...');

    // Update users to require profile completion
    for (const user of usersToFix) {
      const [updatedUser] = await db
        .update(userTable)
        .set({
          role: 'guest', // Set to guest role to trigger profile completion
          needsProfileCompletion: true,
          updatedAt: new Date(),
        })
        .where(eq(userTable.id, user.id))
        .returning();

// TODO: Replace with structured logging - console.log(`✅ Updated ${updatedUser.email}:`, {
        id: updatedUser.id,
        role: updatedUser.role,
        needsProfileCompletion: updatedUser.needsProfileCompletion,
      });
    }

// TODO: Replace with structured logging - console.log(`\n🎉 Successfully updated ${usersToFix.length} users!`);
// TODO: Replace with structured logging - console.log('These users will now be prompted to complete their profile on next login.');

  } catch (error) {
    console.error('❌ Error fixing OAuth users:', error);
    process.exit(1);
  }
}

// Run the fix
fixOAuthUsers()
  .then(() => {
// TODO: Replace with structured logging - console.log('\n✅ OAuth user fix completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ OAuth user fix failed:', error);
    process.exit(1);
  });