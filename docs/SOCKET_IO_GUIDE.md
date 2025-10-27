# Socket.IO Integration Guide

## Overview

The Discord Clone backend now supports **real-time communication** via Socket.IO with **Redis-based presence management** for multi-instance deployment.

## Features

✅ **JWT Authentication** - Secure socket connections  
✅ **Redis Presence** - Track online/offline status across instances  
✅ **Automatic Status Updates** - Update user status in database  
✅ **Multi-Instance Support** - Works across multiple server instances  
✅ **Ping/Pong** - Connection health monitoring  
✅ **Room Management** - Join user-specific rooms  

---

## Architecture

### Connection Flow

```
1. Client connects → Send JWT token
2. Server validates token → Extract userId
3. Store presence in Redis
4. Join room: user:{userId}
5. Update DB status → ONLINE
6. Send confirmation to client
```

### Redis Data Structure

```redis
presence:{userId}:{socketId} → {device, connectedAt, ip}
presence:sockets:{userId}     → Set of socketIds
presence:online:{userId}      → 'true'/'false'
```

### Disconnection Flow

```
1. Client disconnects
2. Remove socket from Redis
3. Check socket count
4. If count = 0 → Update status OFFLINE
5. Publish update via Redis Pub/Sub
```

---

## Client Integration

### 1. Install Client Library

```bash
npm install socket.io-client
```

### 2. Create Socket Client

```typescript
import { io, Socket } from 'socket.io-client';

class DiscordSocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(token: string) {
    if (this.socket?.connected) {
      console.log('Already connected');
      return;
    }

    this.socket = io('http://localhost:3000', {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Connected to server');
      this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected:', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error.message);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
      }
    });

    // Server confirmation
    this.socket.on('connected', (data) => {
      console.log('Server confirmed connection:', data);
    });

    // Presence updates
    this.socket.on('presence:updated', (data) => {
      console.log('Presence update:', data);
      // Update UI with new status
    });
  }

  // Ping to keep connection alive
  startPing() {
    if (!this.socket) return;

    setInterval(() => {
      this.socket?.emit('ping');
    }, 30000); // Every 30 seconds
  }

  // Update user status
  updateStatus(status: 'ONLINE' | 'OFFLINE' | 'IDLE' | 'DND') {
    if (!this.socket) return;

    this.socket.emit('presence:update', { status });
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export default DiscordSocketClient;
```

### 3. React Hook Example

```typescript
import { useEffect, useState, useCallback } from 'react';
import DiscordSocketClient from './DiscordSocketClient';

const useSocket = (token: string | null) => {
  const [socket, setSocket] = useState<DiscordSocketClient | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [presence, setPresence] = useState<any>(null);

  useEffect(() => {
    if (!token) return;

    const client = new DiscordSocketClient();
    client.connect(token);
    
    client.on('connected', () => {
      setIsConnected(true);
    });

    client.on('presence:updated', (data) => {
      setPresence(data);
    });

    setSocket(client);

    return () => {
      client.disconnect();
    };
  }, [token]);

  const updateStatus = useCallback((status: 'ONLINE' | 'OFFLINE' | 'IDLE' | 'DND') => {
    socket?.updateStatus(status);
  }, [socket]);

  return {
    socket,
    isConnected,
    presence,
    updateStatus,
  };
};

export default useSocket;
```

### 4. Usage in Component

```typescript
import React, { useEffect } from 'react';
import useSocket from './hooks/useSocket';

const ChatComponent: React.FC = () => {
  const token = localStorage.getItem('accessToken');
  const { isConnected, presence, updateStatus } = useSocket(token);

  useEffect(() => {
    // Update status when component mounts
    if (isConnected) {
      updateStatus('ONLINE');
    }
  }, [isConnected]);

  const handleIdle = () => {
    updateStatus('IDLE');
  };

  const handleBack = () => {
    updateStatus('ONLINE');
  };

  return (
    <div>
      {isConnected ? (
        <p>✅ Connected</p>
      ) : (
        <p>❌ Disconnected</p>
      )}

      {presence && (
        <p>Status: {presence.status}</p>
      )}

      <button onClick={handleIdle}>Set Idle</button>
      <button onClick={handleBack}>Back Online</button>
    </div>
  );
};

export default ChatComponent;
```

---

## API Endpoints

### Events

#### Client → Server

**`ping`** - Keep connection alive
```typescript
socket.emit('ping');
// Server responds with 'pong'
```

**`presence:update`** - Update user status
```typescript
socket.emit('presence:update', {
  status: 'ONLINE' | 'OFFLINE' | 'IDLE' | 'DND'
});
```

#### Server → Client

**`connected`** - Connection confirmed
```typescript
socket.on('connected', (data) => {
  console.log(data.userId);
  console.log(data.socketId);
});
```

**`pong`** - Ping response
```typescript
socket.on('pong', () => {
  console.log('Server alive');
});
```

**`presence:updated`** - Status update
```typescript
socket.on('presence:updated', (data) => {
  console.log(data.userId);
  console.log(data.status);
  console.log(data.timestamp);
});
```

---

## How It Works

### Authentication

```typescript
// Client sends JWT token in auth
const socket = io('http://localhost:3000', {
  auth: { token: 'your_jwt_token' }
});

// Server validates and extracts userId
// If invalid → disconnect immediately
```

### Presence Management

#### Online Detection

```typescript
// When user connects
await presenceService.markOnline(userId, socketId, {
  device: 'web',
  connectedAt: new Date(),
  ip: clientIp,
});

// Redis stores:
// - Socket metadata
// - Socket IDs set
// - Online status flag
```

#### Offline Detection

```typescript
// When user disconnects
await presenceService.markOffline(userId, socketId);

// Redis removes socket and checks count
// If no sockets left → mark OFFLINE
// Update database
```

### TTL & Auto-Cleanup

```typescript
// Every socket connection has 90s TTL
// Ping resets TTL
// Dead connections auto-removed

// Client should ping every 30s
setInterval(() => socket.emit('ping'), 30000);
```

### Multi-Instance Support

```typescript
// Redis Pub/Sub broadcasts presence updates
// All instances receive and react
// Keeps all servers in sync
```

---

## Testing

### 1. Start Redis

```bash
redis-server
```

### 2. Start Backend

```bash
npm run start:dev
```

### 3. Connect Client

```typescript
import io from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: { token: 'your_jwt_token_here' }
});

socket.on('connect', () => {
  console.log('Connected!');
});

socket.on('connected', (data) => {
  console.log('User ID:', data.userId);
  console.log('Socket ID:', data.socketId);
});
```

### 4. Test Presence

```typescript
// Update status
socket.emit('presence:update', { status: 'IDLE' });

// Listen for updates
socket.on('presence:updated', (data) => {
  console.log('Status changed:', data.status);
});
```

---

## Configuration

### Environment Variables

```env
# Redis Configuration
CACHE_HOST=localhost
CACHE_PORT=6379
CACHE_PASS=

# JWT Configuration (already exists)
JWT_SECRET_ACCESS=your_secret_key
JWT_EXPIRES_IN=7d
```

### WebSocket CORS

Update in `websocket.gateway.ts`:

```typescript
@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'https://yourdomain.com'],
    credentials: true,
  },
})
```

---

## Troubleshooting

### Connection Fails

**Problem:** Cannot connect to server

**Solutions:**
- Check Redis is running: `redis-cli ping`
- Verify JWT token is valid
- Check CORS configuration
- Verify port 3000 is open

### Status Not Updating

**Problem:** Database status doesn't change

**Solutions:**
- Check Redis connection
- Verify userId is correct
- Check database permissions
- Review logs for errors

### Multiple Instances Issues

**Problem:** Presence updates not syncing

**Solutions:**
- Verify Redis Pub/Sub is working
- Check Redis adapter is properly configured
- Ensure all instances connect to same Redis

---

## Summary

✅ **Authentication:** JWT-based secure connections  
✅ **Redis Storage:** Multi-instance presence tracking  
✅ **Auto Status Update:** Automatic ONLINE/OFFLINE  
✅ **TTL Management:** 90s TTL with ping refresh  
✅ **Room System:** User-specific rooms  
✅ **Pub/Sub:** Cross-instance synchronization  
✅ **Ping/Pong:** Connection health monitoring  

The socket system is now ready for production use!

