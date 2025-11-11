# Documentation Index

## Overview
This backend powers a Discord-like application built with NestJS, Prisma (PostgreSQL), Redis, and Socket.IO. Presence is fully Redis-based (volatile, real-time), while permanent data lives in PostgreSQL.

## Contents
- Quick Start: `./QUICK_START_GUIDE.md`
- API Documentation (REST): `./API_DOCUMENTATION.md`
- WebSocket Guide: `./SOCKET_IO_GUIDE.md`
- Presence System (Redis): `./REDIS_PRESENCE_SYSTEM.md`
- Status System Details: `./STATUS_SYSTEM.md`
- Backend Architecture: `./BACKEND_ARCHITECTURE.md`
- WebSocket Testing with Postman: `./WEBSOCKET_POSTMAN_TESTING.md`

## Response Shape
All endpoints return a unified shape via a global interceptor:

```json
{
  "status": "success" | "fail" | "error",
  "code": "STRING_CODE",
  "message": "Human readable message",
  "data": {},
  "timestamp": "optional"
}
```

Codes live in `src/common/constants/response-codes.ts`.

## Presence TL;DR
- Connection status and display status are in Redis.
- Keys used:
  - `presence:online:{userId}` → 'true' if any socket connected
  - `presence:sockets:{userId}` → Set of socketIds
  - `presence:socket:{socketId}` → Socket metadata
  - `display:status:{userId}` → ONLINE | IDLE | DND | Invisible
- Pub/Sub channel: `presence:updates`.

## Key Files
- ApiResponse helper: `src/common/helpers/api-response.helper.ts`
- Response interceptor: `src/common/interceptors/response.interceptor.ts`
- Exception filters: `src/common/filters/*.ts`
- Presence service: `src/modules/websocket/User/services/unified-presence.service.ts`
- WebSocket gateway: `src/modules/websocket/User/websocket.gateway.ts`
- Events constants: `src/common/constants/events.constants.ts`


