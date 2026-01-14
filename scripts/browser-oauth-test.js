// Browser OAuth Test Script
// Copy and paste this into the browser console at http://localhost:8081

// TODO: Replace with structured logging - console.log('🧪 Testing Google OAuth Flow...');

// Test 1: Check if authClient is available
if (typeof authClient !== 'undefined') {
// TODO: Replace with structured logging - console.log('✅ authClient is available');
} else {
// TODO: Replace with structured logging - console.log('❌ authClient is not available in global scope');
}

// Test 2: Check API endpoint
fetch('http://localhost:8081/api/auth')
  .then(res => {
// TODO: Replace with structured logging - console.log('✅ Auth API endpoint status:', res.status);
    return res.text();
  })
  .then(text => {
// TODO: Replace with structured logging - console.log('Auth API response length:', text.length);
  })
  .catch(err => {
    console.error('❌ Auth API error:', err);
  });

// Test 3: Direct OAuth URL test
const oauthUrl = 'http://localhost:8081/api/auth/sign-in/provider/google?callbackURL=' + 
  encodeURIComponent('http://localhost:8081/auth-callback');

// TODO: Replace with structured logging - console.log('📍 OAuth URL:', oauthUrl);

// Test 4: Simulate OAuth initiation
// TODO: Replace with structured logging - console.log('\n🔧 To test OAuth manually:');
// TODO: Replace with structured logging - console.log('1. Find the Google Sign-In button');
// TODO: Replace with structured logging - console.log('2. Click it and watch the console');
// TODO: Replace with structured logging - console.log('3. You should see redirect to accounts.google.com');
// TODO: Replace with structured logging - console.log('\nOr open this URL directly:');
// TODO: Replace with structured logging - console.log(oauthUrl);

// Test 5: Check for any auth errors in console
setTimeout(() => {
  const errors = Array.from(document.querySelectorAll('.error-message'));
  if (errors.length > 0) {
// TODO: Replace with structured logging - console.log('⚠️  Found error messages on page:', errors.map(e => e.textContent));
  }
}, 1000);