#!/bin/bash

# Ngrok Setup Script
# Installs and configures ngrok for stable API URLs during development

set -e

echo "🚀 Ngrok Setup Script"
echo "===================="

# Detect OS
OS="$(uname -s)"
ARCH="$(uname -m)"

# Check if ngrok is already installed
if command -v ngrok &> /dev/null; then
    echo "✅ Ngrok is already installed"
    ngrok version
else
    echo "📦 Installing ngrok..."
    
    case "$OS" in
        Darwin)
            # macOS
            if command -v brew &> /dev/null; then
                echo "Using Homebrew to install ngrok..."
                brew install ngrok/ngrok/ngrok
            else
                echo "Downloading ngrok for macOS..."
                curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.zip -o ngrok.zip
                unzip ngrok.zip
                sudo mv ngrok /usr/local/bin/
                rm ngrok.zip
            fi
            ;;
        Linux)
            # Linux
            echo "Downloading ngrok for Linux..."
            if [ "$ARCH" = "x86_64" ]; then
                curl -s https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-amd64.tgz | tar xz
            else
                curl -s https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-v3-stable-linux-arm64.tgz | tar xz
            fi
            sudo mv ngrok /usr/local/bin/
            ;;
        *)
            echo "❌ Unsupported OS: $OS"
            echo "Please install ngrok manually from: https://ngrok.com/download"
            exit 1
            ;;
    esac
    
    echo "✅ Ngrok installed successfully"
fi

# Check if ngrok is configured with auth token
if ! ngrok config check &> /dev/null; then
    echo ""
    echo "⚠️  Ngrok needs to be configured with an auth token"
    echo ""
    echo "1. Sign up for a free account at: https://dashboard.ngrok.com/signup"
    echo "2. Get your auth token from: https://dashboard.ngrok.com/get-started/your-authtoken"
    echo "3. Run: ngrok config add-authtoken YOUR_AUTH_TOKEN"
    echo ""
    read -p "Do you have an auth token ready? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter your ngrok auth token: " AUTH_TOKEN
        ngrok config add-authtoken "$AUTH_TOKEN"
        echo "✅ Ngrok configured with auth token"
    else
        echo "ℹ️  You can configure it later with: ngrok config add-authtoken YOUR_AUTH_TOKEN"
    fi
fi

# Create ngrok configuration for the project
NGROK_CONFIG="ngrok.yml"
if [ ! -f "$NGROK_CONFIG" ]; then
    echo ""
    echo "📝 Creating ngrok configuration file..."
    cat > "$NGROK_CONFIG" << EOF
version: "2"
authtoken: \${NGROK_AUTH_TOKEN}
tunnels:
  expo-api:
    addr: 8081
    proto: http
    host_header: localhost:8081
    bind_tls: true
    metadata:
      service: "expo-api"
    inspect: false
  expo-dev:
    addr: 19000
    proto: http
    host_header: localhost:19000
    bind_tls: true
    metadata:
      service: "expo-dev"
    inspect: false
EOF
    echo "✅ Created $NGROK_CONFIG"
fi

# Create helper script to start ngrok with proper configuration
NGROK_START_SCRIPT="start-ngrok.sh"
cat > "$NGROK_START_SCRIPT" << 'EOF'
#!/bin/bash

echo "🚀 Starting ngrok tunnels..."
echo ""

# Start ngrok with configuration
ngrok start expo-api expo-dev --config ngrok.yml

# Alternative: Simple single tunnel
# ngrok http 8081
EOF

chmod +x "$NGROK_START_SCRIPT"
echo "✅ Created $NGROK_START_SCRIPT helper"

# Instructions
echo ""
echo "✅ Ngrok setup complete!"
echo ""
echo "📋 Quick Start Guide:"
echo "===================="
echo ""
echo "1. Start ngrok tunnel:"
echo "   ./start-ngrok.sh"
echo "   OR"
echo "   bun run ngrok:start"
echo ""
echo "2. Copy the HTTPS URL (e.g., https://abc123.ngrok.io)"
echo ""
echo "3. Update your .env.local file:"
echo "   EXPO_PUBLIC_API_URL_NGROK=https://abc123.ngrok.io"
echo ""
echo "4. Generate ngrok environment:"
echo "   bun run env:generate:ngrok"
echo ""
echo "5. Start Expo with ngrok URL:"
echo "   bun run start"
echo ""
echo "📌 Pro Tips:"
echo "- Get a custom subdomain with ngrok paid plan"
echo "- Use 'ngrok http 8081 --subdomain=myapp' for consistent URLs"
echo "- Check tunnel status at: http://localhost:4040"
echo ""
echo "🔗 Useful Links:"
echo "- Ngrok Dashboard: https://dashboard.ngrok.com"
echo "- Ngrok Docs: https://ngrok.com/docs"
echo ""

# Add to gitignore if not already there
if ! grep -q "ngrok.yml" .gitignore 2>/dev/null; then
    echo "ngrok.yml" >> .gitignore
    echo "✅ Added ngrok.yml to .gitignore"
fi

if ! grep -q "start-ngrok.sh" .gitignore 2>/dev/null; then
    echo "start-ngrok.sh" >> .gitignore
    echo "✅ Added start-ngrok.sh to .gitignore"
fi