# WebSocket Testing with Postman

## Overview

This guide shows how to test WebSocket connections using Postman's WebSocket support.

## Prerequisites

1. Latest Postman version (with WebSocket support)
2. Server running on `localhost:3000`
3. Valid JWT access token

---

## Step 1: Get Access Token

Before connecting to WebSocket, get your access token:

```http
POST http://localhost:3000/api/v1/auth/register
Content-Type: application/json

{
  "username": "test_user",
  "email": "test@example.com",
  "password": "Test123!",
  "birthdate": "2000-01-01"
}
```

Or login:

```http
POST http://localhost:3000/api/v1/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "Test123!"
}
```

Save the `accessToken` from the response.

---

## Step 2: Connect to WebSocket

### Using Postman UI

1. Open Postman
2. Click **New** → **WebSocket Request**
3. Enter URL: `ws://localhost:3000`
4. Add header:
   ```
   Authorization: Bearer <your_jwt_token>
   ```
5. Click **Connect**

### Expected Response

```json
{
  "message": "Connected successfully",
  "userId": "123456789012345678",
  "socketId": "abc123..."
}
```

---

## Step 3: Test Status Update

After connecting, send messages to test status updates:

### Set Status to IDLE

```json
{
  "event": "status:update",
  "data": {
    "status": "IDLE"
  }
}
```

### Set Status to DND

```json
{
  "event": "status:update",
  "data": {
    "status": "DND"
  }
}
```

### Set Status to OFFLINE (Invisible)

```json
{
  "event": "status:update",
  "data": {
    "status": "OFFLINE"
  }
}
```

### Expected Response

```json
{
  "event": "status:updated",
  "data": {
    "userId": "123456789012345678",
    "status": "IDLE",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

---

## Step 4: Get Current Status

### Request

```json
{
  "event": "status:get",
  "data": {}
}
```

### Expected Response

```json
{
  "event": "status:current",
  "data": {
    "displayStatus": "IDLE",
    "actualStatus": "ONLINE"
  }
}
```

---

## Step 5: Test Ping (Optional)

### Request

```json
{
  "event": "ping",
  "data": {}
}
```

### Expected Response

```json
{
  "event": "pong",
  "data": {}
}
```

---

## Complete Testing Flow

### 1. Register/Login

```javascript
// Use existing REST API
POST /auth/register
→ Get accessToken
```

### 2. Connect to WebSocket

```javascript
ws://localhost:3000
Header: Authorization: Bearer <token>
→ Should receive 'connected' event
```

### 3. Test Status Updates

```javascript
// Send
{ "event": "status:update", "data": { "status": "IDLE" } }
// Receive
{ "event": "status:updated", "data": {...} }
```

### 4. Test Get Status

```javascript
// Send
{ "event": "status:get", "data": {} }
// Receive
{ "event": "status:current", "data": {...} }
```

### 5. Disconnect

```javascript
// Close connection or send disconnect event
→ Check if status changed to OFFLINE in database
```

---

## Postman Collection Structure

```json
{
  "info": {
    "name": "Discord WebSocket API"
  },
  "item": [
    {
      "name": "Connect",
      "request": {
        "method": "GET",
        "url": {
          "raw": "ws://localhost:3000"
        },
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{accessToken}}"
          }
        ]
      }
    }
  ]
}
```

---

## Testing Scenarios

### Scenario 1: Normal Status Change

```
1. Connect → Receives 'connected'
2. Update status to IDLE → Receives 'status:updated'
3. Get status → Receives 'status:current' with IDLE
4. Update status to DND → Receives 'status:updated'
5. Disconnect → Status should be OFFLINE
```

### Scenario 2: Invisible Mode

```
1. Connect → Actual: ONLINE
2. Set status to OFFLINE → Display: OFFLINE, Actual: ONLINE
3. Check database → Should show OFFLINE
4. Disconnect → Both should be OFFLINE
```

### Scenario 3: Multi-Device

```
1. Connect Device 1 → Online
2. Update status on Device 1 → IDLE
3. Connect Device 2 → Should receive status as IDLE
4. Update status on Device 2 → DND
5. Device 1 should receive status update event
```

---

## Troubleshooting

### Connection Failed

**Problem:** Cannot connect to WebSocket

**Solutions:**
- Check if server is running
- Verify JWT token is valid
- Check CORS configuration
- Try with different connection protocol (ws/wss)

### No Response

**Problem:** Connected but no responses

**Solutions:**
- Check server logs for errors
- Verify Redis is running
- Check network tab in browser developer tools
- Verify event names are correct

### Status Not Updating

**Problem:** Status change not reflected

**Solutions:**
- Check Redis connection
- Verify database update
- Check for errors in server logs
- Verify userId is correct

---

## Manual cURL Alternative

If Postman doesn't work, use a WebSocket client:

```bash
npm install -g wscat
wscat -c ws://localhost:3000 -H "Authorization: Bearer YOUR_TOKEN"
```

Then send events manually:

```json
{"event": "status:update", "data": {"status": "IDLE"}}
```

---

## Reference

### Available Events

#### Client → Server

- `status:update` - Update display status
- `status:get` - Get current status
- `ping` - Ping server (optional)

#### Server → Client

- `connected` - Connection established
- `status:updated` - Status change confirmed
- `status:current` - Current status response
- `pong` - Ping response (optional)

---

## Next Steps

1. Test all status transitions
2. Test with multiple devices
3. Test disconnect scenarios
4. Test with invalid tokens
5. Test with Redis down scenario

