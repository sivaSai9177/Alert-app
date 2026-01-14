# Network Setup Guide

## 🌐 Multi-Network Development Setup

This guide helps you develop across multiple WiFi networks without connection issues.

## Current Network Configuration

Your project is configured to work with multiple WiFi networks:

1. **Primary WiFi**: `192.168.1.x` (IPs: 192.168.1.16, 192.168.1.101)
2. **Secondary WiFi**: `192.168.2.x` (IP: 192.168.2.1) 
3. **Tertiary WiFi**: `192.168.3.x` (IP: 192.168.3.1)

## 🚀 Quick Solutions

### Option 1: Use Tunnel Mode (Recommended)
Works across any network without configuration:
```bash
bun start:tunnel
```
- ✅ Works on any WiFi network
- ✅ No IP configuration needed
- ✅ Shareable URL for testing
- ⚠️ Slightly slower than LAN

### Option 2: Auto-Detect Network (Default)
Automatically detects your current network:
```bash
bun start
```
- ✅ Fast local development
- ✅ Auto-detects IP address
- ⚠️ May need restart when switching networks

### Option 3: Network-Specific Commands
Use specific commands for each network:
```bash
# For primary WiFi (192.168.1.x)
bun start:multi-network

# For secondary WiFi (192.168.2.x)  
bun start:secondary-wifi
```

## 🔍 Network Troubleshooting

### 1. Check Current Network
```bash
bun scripts/check-network.ts
```
This will show:
- Your current IP address
- Detected network configuration
- Available endpoints
- Connection test results

### 2. Update IP Configuration
If auto-detection fails:
```bash
bun env:update-ip
```

### 3. Clear Cache and Restart
```bash
# Kill existing processes
pkill -f expo && pkill -f metro

# Clear cache and start
bun start --clear
```

## 📱 Simulator/Emulator Access

### iOS Simulator
- Always uses `localhost:8081`
- No special configuration needed

### Android Emulator  
- Uses special IP: `10.0.2.2:8081`
- Automatically configured

### Physical Devices
- Must be on same WiFi network
- Use tunnel mode for different networks

## 🛠️ Advanced Configuration

### Add New Network
Edit `/lib/core/network-config.ts`:
```typescript
export const NETWORK_CONFIGS = {
  // ... existing configs
  myNetwork: {
    name: 'My Network',
    ipRange: '192.168.X.x',
    expectedIPs: ['192.168.X.Y'],
    apiPort: 8081,
    dbPort: 5432,
  }
};
```

### Force Specific IP
```bash
EXPO_PUBLIC_API_URL=http://192.168.X.Y:8081 bun start
```

## 🐛 Common Issues

### "Could not connect to server"
1. Check if Expo is running: `ps aux | grep expo`
2. Try tunnel mode: `bun start:tunnel`
3. Clear cache: `rm -rf .expo && bun start --clear`

### "Network response timed out"
1. Check firewall settings
2. Ensure devices are on same network
3. Use tunnel mode for cross-network access

### IP Address Changed
1. Restart Expo: `bun start --clear`
2. Or use tunnel mode: `bun start:tunnel`

## 📋 Best Practices

1. **Development**: Use `bun start` for auto-detection
2. **Testing**: Use `bun start:tunnel` for stable URLs
3. **Multiple Devices**: Always use tunnel mode
4. **OAuth Testing**: Use ngrok commands

## 🔗 Related Commands

```bash
# Database with specific network
bun db:local:up          # Start local PostgreSQL
bun web:local            # Web with local DB
bun expo:go:local        # Expo Go with local DB

# OAuth testing with ngrok
bun ngrok:setup          # One-time setup
bun ngrok:start          # Start tunnel
bun web:ngrok            # Web with ngrok URL
```

## 📱 Mobile Development Tips

### Expo Go App
- Works best with tunnel mode
- Or ensure phone is on same WiFi

### Development Builds
- Configure with your network IPs
- Use EAS build variables for flexibility

### Preview Builds
- Always use ngrok/tunnel for testing
- Share stable URLs with testers

---

**Pro Tip**: For hassle-free development across networks, use tunnel mode by default and switch to LAN mode only when you need faster reload times.