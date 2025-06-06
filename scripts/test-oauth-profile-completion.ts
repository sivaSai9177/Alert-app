#!/usr/bin/env tsx
/**
 * Test script to verify OAuth user profile completion detection
 */

import { db } from '../src/db';
import { user as userTable } from '../src/db/schema';
import { eq } from 'drizzle-orm';

async function testOAuthProfileCompletion() {
  console.log('🧪 Testing OAuth profile completion detection...\n');

  try {
    // Test email to check
    const testEmail = 'saipramod273@gmail.com';
    
    // Find the user
    const [user] = await db
      .select()
      .from(userTable)
      .where(eq(userTable.email, testEmail))
      .limit(1);

    if (!user) {
      console.log(`❌ User ${testEmail} not found`);
      return;
    }

    console.log(`📋 User Details:`, {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      needsProfileCompletion: user.needsProfileCompletion,
      organizationId: user.organizationId,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    });

    // Check profile completion logic
    const requiresProfileCompletion = 
      (!user.role || user.role === 'guest') && 
      user.needsProfileCompletion === true;

    console.log(`\n🔍 Profile Completion Check:`);
    console.log(`  - Has role: ${!!user.role} (${user.role || 'none'})`);
    console.log(`  - Is guest: ${user.role === 'guest'}`);
    console.log(`  - needsProfileCompletion flag: ${user.needsProfileCompletion}`);
    console.log(`  - 🎯 Requires profile completion: ${requiresProfileCompletion ? '✅ YES' : '❌ NO'}`);

    if (requiresProfileCompletion) {
      console.log(`\n✅ User will be redirected to complete their profile!`);
    } else {
      console.log(`\n❌ User will NOT be prompted for profile completion`);
    }

    // List all OAuth users
    console.log(`\n📊 All OAuth Users Status:`);
    const oauthUsers = await db
      .select({
        email: userTable.email,
        role: userTable.role,
        needsProfileCompletion: userTable.needsProfileCompletion,
        organizationId: userTable.organizationId,
      })
      .from(userTable)
      .where(eq(userTable.emailVerified, true));

    for (const oauthUser of oauthUsers) {
      const status = oauthUser.needsProfileCompletion && (!oauthUser.role || oauthUser.role === 'guest') 
        ? '⏳ Needs completion' 
        : '✅ Complete';
      console.log(`  - ${oauthUser.email}: ${status} (role: ${oauthUser.role || 'none'})`);
    }

  } catch (error) {
    console.error('❌ Error testing OAuth profile completion:', error);
    process.exit(1);
  }
}

// Run the test
testOAuthProfileCompletion()
  .then(() => {
    console.log('\n✅ Test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });