# API Documentation

Base URL: `http://localhost:3000/api/v1`

All responses follow the unified format `{ status, code, message, data }`.

## Auth
- POST `/auth/register`
- POST `/auth/login`

## Users
- GET `/users/profile` → current user profile
- PUT `/users/profile/password`
- PUT `/users/profile/global-name`
- PUT `/users/profile/custom-status`
- PUT `/users/profile/username`

Response example (profile):
```json
{
  "status": "success",
  "code": "USER_PROFILE_FETCHED",
  "message": "User profile fetched successfully",
  "data": {
    "user": { "id": "...", "username": "..." },
    "presence": { "status": "IDLE" },
    "customStatus": { "text": "...", "emoji": "..." },
    "isOnline": true
  }
}
```

Notes:
- `isOnline` from Redis (connection status)
- `presence.status` from DB (Display Status) or `Invisible` if offline
- `customStatus` omitted (null) when offline for performance

## Friends
- POST `/users/friends/request`
- PUT `/users/friends/respond`
- DELETE `/users/friends/cancel`
- DELETE `/users/friends/remove`
- GET `/users/friends`
- GET `/users/friends/requests/incoming`
- GET `/users/friends/requests/outgoing`
- GET `/users/friends/mutual/:userId`
- GET `/users/friends/check/:userId`
- GET `/users/relations` (blocked/ignored/muted)

Presence batching: friends list presence is fetched via Redis pipeline in one shot.

## Errors
Errors also use the unified shape with `status: error|fail` and a string `code`.


