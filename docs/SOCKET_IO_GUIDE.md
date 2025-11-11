# Socket.IO Guide

## Overview
- Auth via JWT in `auth` or `Authorization` header
- Per-user rooms: `user:{userId}`
- Presence sync: Pub/Sub `presence:updates`
- Initial presence sync on connect via batch pipeline

## Events
- Server → Client:
  - `CONNECTED`
  - `INITIAL_PRESENCE_SYNC`
  - `PRESENCE_UPDATE`
  - `GUILD_INIT`, `DM_INIT`, `MESSAGE_CREATE`
- Client → Server (selected):
  - `status:get` (deprecated: `status:update` → use REST)

## Connect
```ts
import { io } from 'socket.io-client';
const socket = io('http://localhost:3000', { auth: { token } });
```

## Initial Presence
On connect, server emits `INITIAL_PRESENCE_SYNC` with friends' presence snapshot.

## Presence Updates
Subsequent updates arrive via `PRESENCE_UPDATE` for your friends only.


