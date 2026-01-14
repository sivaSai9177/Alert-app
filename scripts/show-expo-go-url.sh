#!/bin/bash

# Show the correct Expo Go URL for physical devices

echo "📱 Expo Go URL Helper"
echo "===================="
echo ""

# Get local IP
if [[ "$OSTYPE" == "darwin"* ]]; then
    LOCAL_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null)
else
    LOCAL_IP=$(hostname -I | awk '{print $1}')
fi

echo "Your correct Expo Go URL is:"
echo ""
echo "👉 exp://$LOCAL_IP:8081"
echo ""
echo "To use on your physical device:"
echo "1. Open Expo Go app"
echo "2. Tap 'Enter URL manually'"
echo "3. Type: exp://$LOCAL_IP:8081"
echo "4. Tap 'Connect'"
echo ""
echo "Make sure your phone is on the same WiFi network!"