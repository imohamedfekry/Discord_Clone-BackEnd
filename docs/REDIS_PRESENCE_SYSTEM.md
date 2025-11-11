# Redis Presence System

## Keys
- `presence:online:{userId}` → 'true' if any socket connected (EX 90s)
- `presence:sockets:{userId}` → Set of socketIds (EX 90s)
- `presence:socket:{socketId}` → Hash metadata (EX 90s)
- `display:status:{userId}` → ONLINE | IDLE | DND | Invisible (EX 24h)

## Pub/Sub
- Channel: `presence:updates` (JSON payloads)
- Used to sync presence across app instances.

## Methods (Service)
- `markOnline(userId, socketId, meta)`
- `markOffline(userId, socketId)`
- `getPresenceStatus(userId)` → `{ isOnline, displayStatus, actualStatus }`
- `getBatchPresence(userIds)` → pipeline snapshot for lists

## Logic
- On connect: set socket metadata, add to set, set online flag, publish update
- On disconnect: remove socket; if none remain → remove online flag, publish update


