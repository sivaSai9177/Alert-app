#!/bin/bash

echo "📱 Android Physical Device Setup with ngrok"
echo "=========================================="
echo ""

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok is not installed!"
    echo "Install it with: npm install -g ngrok"
    echo "Or download from: https://ngrok.com/download"
    exit 1
fi

# Check if server is running
if ! lsof -i:8081 &> /dev/null; then
    echo "⚠️  Your server is not running on port 8081!"
    echo "Please run 'bun run dev' in another terminal first."
    exit 1
fi

echo "✅ Server is running on port 8081"
echo ""
echo "🚀 Starting ngrok tunnel..."
echo ""

# Start ngrok and capture output
ngrok http 8081 &
NGROK_PID=$!

# Wait for ngrok to start
sleep 3

# Get the ngrok URL using the API
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | cut -d'"' -f4)

if [ -z "$NGROK_URL" ]; then
    echo "❌ Failed to get ngrok URL. Please check ngrok output above."
    kill $NGROK_PID 2>/dev/null
    exit 1
fi

echo ""
echo "✅ ngrok tunnel created!"
echo "📍 Your public URL is: $NGROK_URL"
echo ""
echo "📝 Next Steps:"
echo "1. Update .env.preview file:"
echo "   EXPO_PUBLIC_API_URL=$NGROK_URL"
echo ""
echo "2. Rebuild your app with:"
echo "   eas build --profile preview --platform android"
echo ""
echo "3. Or if you're using Expo Go for testing:"
echo "   - Update .env file instead"
echo "   - Restart your server with 'bun run dev'"
echo ""
echo "⚠️  Important Notes:"
echo "- ngrok URL changes each time you restart it"
echo "- Keep this terminal open while testing"
echo "- Free ngrok has request limits"
echo ""
echo "🔗 ngrok web interface: http://localhost:4040"
echo ""
echo "Press Ctrl+C to stop ngrok tunnel"

# Wait for user to stop
wait $NGROK_PID