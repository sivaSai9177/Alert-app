#!/bin/bash

# Stop WebSocket server gracefully

echo "🛑 Stopping WebSocket server..."

# Check if PID file exists
if [ -f /tmp/websocket-server.pid ]; then
    PID=$(cat /tmp/websocket-server.pid)
    
    # Check if process is running
    if ps -p $PID > /dev/null 2>&1; then
        kill $PID
        echo "✅ WebSocket server stopped (PID: $PID)"
        rm /tmp/websocket-server.pid
    else
        echo "⚠️  WebSocket server not running (PID: $PID)"
        rm /tmp/websocket-server.pid
    fi
else
    echo "⚠️  No WebSocket server PID file found"
    
    # Try to find and kill by process name as fallback
    PID=$(ps aux | grep "node scripts/standalone-websocket.ts" | grep -v grep | awk '{print $2}')
    if [ ! -z "$PID" ]; then
        kill $PID
        echo "✅ WebSocket server stopped (found PID: $PID)"
    else
        echo "ℹ️  No WebSocket server process found"
    fi
fi

# Clean up log file
if [ -f /tmp/websocket-server.log ]; then
    echo "🧹 Cleaning up WebSocket log file"
    rm /tmp/websocket-server.log
fi