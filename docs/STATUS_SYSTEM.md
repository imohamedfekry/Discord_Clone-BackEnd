# Status System Documentation

## Overview

The system uses a **dual-status** mechanism:
- **Actual Status**: Real connection state (Socket.IO managed)
- **Display Status**: What the user wants to show (User-controlled)

## How It Works

### Status Flow

```
User opens site → Actual: ONLINE
     ↓
User chooses IDLE → Display: IDLE
     ↓
User goes offline → Actual: OFFLINE → Display forced to OFFLINE
```

### Examples

#### Scenario 1: User wants to be invisible
```typescript
// User is online, but wants to appear offline
socket.emit('status:update', { status: 'OFFLINE' });

// Result:
// Actual: ONLINE (socket connected)
// Display: OFFLINE (user choice)
// Friends see: OFFLINE
```

#### Scenario 2: User wants to be idle
```typescript
// User active, but not doing anything
socket.emit('status:update', { status: 'IDLE' });

// Result:
// Actual: ONLINE
// Display: IDLE
// Friends see: IDLE
```

#### Scenario 3: User disconnects
```typescript
// User closes browser/tab
// Automatic disconnect

// Result:
// Actual: OFFLINE (forced)
// Display: OFFLINE (forced)
// Friends see: OFFLINE
```

## API Usage

### Update Display Status

```typescript
// Client code
socket.emit('status:update', { 
  status: 'IDLE' // or 'ONLINE', 'DND', 'OFFLINE'
});

// Listen for confirmation
socket.on('status:updated', (data) => {
  console.log('Status changed:', data.status);
});
```

### Get Current Status

```typescript
// Get both actual and display status
socket.emit('status:get');

// Listen for response
socket.on('status:current', (data) => {
  console.log('Display:', data.displayStatus); // What user wants
  console.log('Actual:', data.actualStatus);   // Real connection
});
```

## Data Storage

### Redis Structure

```redis
display:status:{userId} → 'ONLINE' | 'IDLE' | 'DND' | 'OFFLINE'
```

### Database

The `status` field in the `User` table stores the **Display Status**.

## Status Logic

### Display Rules

1. **User Online + Chooses Status** → Display = Chosen Status
2. **User Disconnects** → Display = OFFLINE (forced)
3. **User Reconnects** → Display = Last chosen status (or ONLINE)

### Implementation

```typescript
// When user updates status
await redis.set(`display:status:${userId}`, status);
await db.updateUser(userId, { status });

// When displaying status to friends
const displayStatus = await redis.get(`display:status:${userId}`);
const actualStatus = await presenceService.isOnline(userId);

// Show to friends
const finalStatus = actualStatus === 'OFFLINE' ? 'OFFLINE' : displayStatus;
```

## Client-Side Example

```typescript
class StatusManager {
  private socket: Socket;

  constructor(socket: Socket) {
    this.socket = socket;
    this.setupListeners();
  }

  // Set status manually
  setStatus(status: 'ONLINE' | 'IDLE' | 'DND' | 'OFFLINE') {
    this.socket.emit('status:update', { status });
  }

  // Get current status
  getStatus() {
    this.socket.emit('status:get');
  }

  // Listen for status updates from server
  onStatusUpdate(callback: (data: any) => void) {
    this.socket.on('status:updated', callback);
  }

  // Listen for current status response
  onStatusCurrent(callback: (data: any) => void) {
    this.socket.on('status:current', callback);
  }

  private setupListeners() {
    this.onStatusUpdate((data) => {
      console.log('Status updated:', data.status);
      // Update UI
    });

    this.onStatusCurrent((data) => {
      console.log('Current status:', data.displayStatus);
      console.log('Actual status:', data.actualStatus);
      // Update UI
    });
  }
}
```

## Auto-Idle Detection (Future Enhancement)

For automatic IDLE detection, you can add:

```typescript
// After 5 minutes of no user activity
setTimeout(() => {
  if (userNotActive) {
    socket.emit('status:update', { status: 'IDLE' });
  }
}, 5 * 60 * 1000);
```

## Status Priority

| Actual Status | User Choice | Displayed Status |
|--------------|-------------|------------------|
| ONLINE | OFFLINE | OFFLINE (invisible) |
| ONLINE | IDLE | IDLE |
| ONLINE | DND | DND |
| ONLINE | ONLINE | ONLINE |
| OFFLINE | * | OFFLINE (forced) |

This provides the perfect "invisible mode" feature where users can be online but appear offline to others.

