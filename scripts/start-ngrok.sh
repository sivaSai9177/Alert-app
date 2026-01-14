#!/bin/bash

# Start ngrok for Expo development
echo "🚀 Starting ngrok tunnel for localhost:8081..."

# Start ngrok in background and capture the output
ngrok http 8081 > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!

# Wait for ngrok to start
sleep 3

# Get the public URL from ngrok API
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | grep -o 'https://[^"]*' | head -1)

if [ -z "$NGROK_URL" ]; then
    echo "❌ Failed to get ngrok URL. Make sure ngrok is properly configured."
    kill $NGROK_PID 2>/dev/null
    exit 1
fi

echo "✅ Ngrok tunnel started: $NGROK_URL"
echo "📝 Updating environment configuration..."

# Update .env.local with the ngrok URL
if [ -f .env.local ]; then
    # Update or add EXPO_PUBLIC_API_URL_NGROK
    if grep -q "EXPO_PUBLIC_API_URL_NGROK=" .env.local; then
        sed -i '' "s|EXPO_PUBLIC_API_URL_NGROK=.*|EXPO_PUBLIC_API_URL_NGROK=$NGROK_URL|" .env.local
    else
        echo "EXPO_PUBLIC_API_URL_NGROK=$NGROK_URL" >> .env.local
    fi
    
    # Update BETTER_AUTH_BASE_URL for ngrok
    if grep -q "BETTER_AUTH_BASE_URL=" .env.local; then
        sed -i '' "s|BETTER_AUTH_BASE_URL=.*|BETTER_AUTH_BASE_URL=$NGROK_URL/api/auth|" .env.local
    else
        echo "BETTER_AUTH_BASE_URL=$NGROK_URL/api/auth" >> .env.local
    fi
fi

# Create a temporary file with the ngrok URL for other scripts
echo "$NGROK_URL" > .ngrok-url

echo "✅ Environment updated with ngrok URL"
echo ""
echo "📱 For EAS builds, update eas.json with:"
echo "   \"EXPO_PUBLIC_API_URL_NGROK\": \"$NGROK_URL\""
echo "   \"BETTER_AUTH_BASE_URL\": \"$NGROK_URL/api/auth\""
echo ""
echo "🌐 Ngrok dashboard: https://dashboard.ngrok.com/cloud-edge/endpoints"
echo "📊 Local inspector: http://localhost:4040"
echo ""
echo "Press Ctrl+C to stop ngrok"

# Keep the script running
wait $NGROK_PID