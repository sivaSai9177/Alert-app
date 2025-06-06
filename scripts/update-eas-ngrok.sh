#!/bin/bash

# Update EAS configuration with current ngrok URL

if [ ! -f .ngrok-url ]; then
    echo "❌ No ngrok URL found. Please run ./scripts/start-ngrok.sh first"
    exit 1
fi

NGROK_URL=$(cat .ngrok-url)
echo "📝 Updating EAS configuration with ngrok URL: $NGROK_URL"

# Get current values from .env
BETTER_AUTH_SECRET=$(grep "^BETTER_AUTH_SECRET=" .env | cut -d'=' -f2-)
DATABASE_URL=$(grep "^DATABASE_URL=" .env | cut -d'=' -f2-)

if [ -z "$BETTER_AUTH_SECRET" ] || [ -z "$DATABASE_URL" ]; then
    echo "❌ Missing required environment variables in .env"
    echo "   Please ensure BETTER_AUTH_SECRET and DATABASE_URL are set"
    exit 1
fi

# Create a temporary file with the updated configuration
cat > /tmp/eas-update.json << EOF
{
  "EXPO_PUBLIC_API_URL_NGROK": "$NGROK_URL",
  "BETTER_AUTH_BASE_URL": "$NGROK_URL/api/auth",
  "BETTER_AUTH_SECRET": "$BETTER_AUTH_SECRET",
  "DATABASE_URL": "$DATABASE_URL"
}
EOF

# Update eas.json using node to properly handle JSON
node -e "
const fs = require('fs');
const easConfig = JSON.parse(fs.readFileSync('eas.json', 'utf8'));
const updates = JSON.parse(fs.readFileSync('/tmp/eas-update.json', 'utf8'));

// Update local-ngrok profile
if (!easConfig.build['local-ngrok']) {
    easConfig.build['local-ngrok'] = { extends: 'development', env: {} };
}

Object.assign(easConfig.build['local-ngrok'].env, updates);

fs.writeFileSync('eas.json', JSON.stringify(easConfig, null, 2));
console.log('✅ EAS configuration updated successfully');
"

rm /tmp/eas-update.json

echo ""
echo "🚀 Ready to build with EAS:"
echo "   eas build --profile local-ngrok --platform ios"
echo "   eas build --profile local-ngrok --platform android"