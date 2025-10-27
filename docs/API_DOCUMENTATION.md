# Discord Clone API Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Base URL & Authentication](#base-url--authentication)
3. [Data Types & Validation](#data-types--validation)
4. [Response Format](#response-format)
5. [Authentication APIs](#authentication-apis)
6. [User Profile APIs](#user-profile-apis)
7. [Friendship APIs](#friendship-apis)
8. [User Relations APIs](#user-relations-apis)
9. [Error Handling](#error-handling)
10. [Frontend Integration Guide](#frontend-integration-guide)

---

## Overview

This is a Discord Clone backend API built with NestJS, Prisma, and PostgreSQL. The API provides user authentication, profile management, friendship system, and user relations (block, mute, ignore).

**Tech Stack:**
- NestJS (Node.js framework)
- Prisma (ORM)
- PostgreSQL (Database)
- JWT (Authentication)
- Class Validator (Validation)

---

## Base URL & Authentication

### Base URL
```
http://localhost:3000/api/v1
```

### Authentication
All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

**Token Format:**
- Access Token: Used for API requests
- Refresh Token: Used to get new access tokens

---

## Data Types & Validation

### User ID Format
- **Type:** String
- **Format:** 16-19 digits (Snowflake ID)
- **Example:** `"123456789012345678"`
- **Validation:** Must match regex `/^\d{16,19}$/`

### Username Format
- **Type:** String
- **Length:** 3-32 characters
- **Allowed Characters:** Letters (a-z, A-Z), numbers (0-9), underscores (_), dots (.)
- **Reserved Words:** `admin`, `support`, `discord`, `system`
- **Example:** `"john_doe"`, `"user123"`, `"alice.dev"`
- **Validation:** Must match regex `/^[a-zA-Z0-9._]+$/`

### Email Format
- **Type:** String
- **Format:** Valid email address
- **Example:** `"user@example.com"`

### Password Format
- **Type:** String
- **Requirements:** Strong password (at least 8 characters, uppercase, lowercase, number, special character)
- **Example:** `"MyPassword123!"`

### Date Format
- **Type:** Date
- **Format:** ISO 8601 (`YYYY-MM-DD`)
- **Example:** `"2002-10-26"`

### Enums

#### User Status
```typescript
enum UserStatus {
  ONLINE = "ONLINE"
  OFFLINE = "OFFLINE"
  IDLE = "IDLE"
  DND = "DND" // Do Not Disturb
}
```

#### Friendship Status
```typescript
enum FriendshipStatus {
  PENDING = "PENDING"
  ACCEPTED = "ACCEPTED"
}
```

#### Relation Type
```typescript
enum RelationType {
  BLOCKED = "BLOCKED"
  IGNORED = "IGNORED"
  MUTED = "MUTED"
}
```

---

## Response Format

### Success Response
```json
{
  "status": "success",
  "code": 200,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Response
```json
{
  "status": "error",
  "code": 400,
  "message": "Validation failed",
  "errors": [
    {
      "field": "username",
      "message": "Username must be at least 3 characters long",
      "value": "ab"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Validation Error Response
```json
{
  "status": "fail",
  "code": 422,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Email must be a valid email address",
      "value": "invalid-email"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Authentication APIs

### 1. Register User

**Endpoint:** `POST /auth/register`

**Description:** Create a new user account

**Request Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "MyPassword123!",
  "birthdate": "2002-10-26"
}
```

**Validation Rules:**
- `username`: Required, 3-32 chars, alphanumeric + underscore + dot
- `email`: Required, valid email format
- `password`: Required, strong password
- `birthdate`: Required, valid date, must be in the past

**Success Response (201):**
```json
{
  "status": "success",
  "code": 201,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "123456789012345678",
      "username": "john_doe",
      "email": "john@example.com",
      "globalName": null,
      "phone": null,
      "avatar": null,
      "status": "OFFLINE",
      "customStatus": null,
      "isBot": false,
      "birthdate": "2002-10-26T00:00:00.000Z",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `400`: Username already exists
- `400`: Email already exists
- `422`: Validation errors

### 2. Login User

**Endpoint:** `POST /auth/login`

**Description:** Authenticate user and get tokens

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "MyPassword123!"
}
```

**Validation Rules:**
- `email`: Required, valid email format
- `password`: Required, strong password

**Success Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Responses:**
- `401`: Invalid credentials
- `422`: Validation errors

---

## User Profile APIs

### 1. Get User Profile

**Endpoint:** `GET /users/profile`

**Description:** Get current user's profile information

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Profile retrieved successfully",
  "data": {
    "id": "123456789012345678",
    "username": "john_doe",
    "globalName": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "avatar": "https://example.com/avatar.jpg",
    "status": "ONLINE",
    "customStatus": "Playing Minecraft",
    "isBot": false,
    "birthdate": "2002-10-26T00:00:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Update Password

**Endpoint:** `PUT /users/profile/password`

**Description:** Update user password

**Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

**Validation Rules:**
- `currentPassword`: Required, strong password
- `newPassword`: Required, strong password

**Success Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Password updated successfully",
  "data": {
    "id": "123456789012345678",
    "username": "john_doe",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3. Update Global Name

**Endpoint:** `PUT /users/profile/global-name`

**Description:** Update user's global display name

**Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "globalName": "John Doe"
}
```

**Validation Rules:**
- `globalName`: Optional, max 32 characters

**Success Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Global name updated successfully",
  "data": {
    "id": "123456789012345678",
    "username": "john_doe",
    "globalName": "John Doe",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 4. Update Custom Status

**Endpoint:** `PUT /users/profile/custom-status`

**Description:** Update user's custom status message

**Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "customStatus": "Playing Minecraft"
}
```

**Validation Rules:**
- `customStatus`: Optional, max 128 characters

**Success Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Custom status updated successfully",
  "data": {
    "id": "123456789012345678",
    "username": "john_doe",
    "customStatus": "Playing Minecraft",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 5. Update Username

**Endpoint:** `PUT /users/profile/username`

**Description:** Update user's username

**Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "john_doe_2024"
}
```

**Validation Rules:**
- `username`: Required, 3-32 chars, alphanumeric + underscore + dot, not reserved

**Success Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Username updated successfully",
  "data": {
    "id": "123456789012345678",
    "username": "john_doe_2024",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Friendship APIs

### 1. Send Friend Request

**Endpoint:** `POST /users/friends/request`

**Description:** Send a friend request to another user

**Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "jane_doe"
}
```
OR
```json
{
  "userId": "987654321098765432"
}
```

**Validation Rules:**
- Either `username` OR `userId` is required (not both)
- `username`: Valid username format
- `userId`: Valid ID format (16-19 digits)

**Success Response (201):**
```json
{
  "status": "success",
  "code": 201,
  "message": "Friend request sent successfully",
  "data": {
    "id": "123456789012345678",
    "user1Id": "123456789012345678",
    "user2Id": "987654321098765432",
    "status": "PENDING",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Respond to Friend Request

**Endpoint:** `PUT /users/friends/respond`

**Description:** Accept or reject a friend request

**Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "friendshipId": "123456789012345678",
  "status": "ACCEPTED"
}
```

**Validation Rules:**
- `friendshipId`: Required, valid ID format
- `status`: Required, must be "ACCEPTED" or "REJECTED"

**Success Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Friend request responded successfully",
  "data": {
    "id": "123456789012345678",
    "user1Id": "123456789012345678",
    "user2Id": "987654321098765432",
    "status": "ACCEPTED",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3. Get Friends List

**Endpoint:** `GET /users/friends`

**Description:** Get user's friends list

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `status` (optional): Filter by friendship status (PENDING, ACCEPTED)
- `page` (optional): Page number for pagination
- `limit` (optional): Number of items per page

**Example:**
```
GET /users/friends?status=ACCEPTED&page=1&limit=20
```

**Success Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Friends list retrieved successfully",
  "data": [
    {
      "id": "123456789012345678",
      "user1Id": "123456789012345678",
      "user2Id": "987654321098765432",
      "status": "ACCEPTED",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "friend": {
        "id": "987654321098765432",
        "username": "jane_doe",
        "globalName": "Jane Doe",
        "avatar": "https://example.com/avatar.jpg",
        "status": "ONLINE"
      }
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 4. Get Incoming Friend Requests

**Endpoint:** `GET /users/friends/requests/incoming`

**Description:** Get pending friend requests received by the user

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Incoming friend requests retrieved successfully",
  "data": [
    {
      "id": "123456789012345678",
      "user1Id": "987654321098765432",
      "user2Id": "123456789012345678",
      "status": "PENDING",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "requester": {
        "id": "987654321098765432",
        "username": "jane_doe",
        "globalName": "Jane Doe",
        "avatar": "https://example.com/avatar.jpg",
        "status": "ONLINE"
      }
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 5. Get Outgoing Friend Requests

**Endpoint:** `GET /users/friends/requests/outgoing`

**Description:** Get pending friend requests sent by the user

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Outgoing friend requests retrieved successfully",
  "data": [
    {
      "id": "123456789012345678",
      "user1Id": "123456789012345678",
      "user2Id": "987654321098765432",
      "status": "PENDING",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "target": {
        "id": "987654321098765432",
        "username": "jane_doe",
        "globalName": "Jane Doe",
        "avatar": "https://example.com/avatar.jpg",
        "status": "ONLINE"
      }
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 6. Get Mutual Friends

**Endpoint:** `GET /users/friends/mutual/{userId}`

**Description:** Get mutual friends with another user

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `userId`: The ID of the user to get mutual friends with

**Success Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Mutual friends retrieved successfully",
  "data": [
    {
      "id": "111111111111111111",
      "username": "mutual_friend",
      "globalName": "Mutual Friend",
      "avatar": "https://example.com/avatar.jpg",
      "status": "ONLINE"
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 7. Check Friendship Status

**Endpoint:** `GET /users/friends/check/{userId}`

**Description:** Check friendship status with another user

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Path Parameters:**
- `userId`: The ID of the user to check friendship with

**Success Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Friendship status checked successfully",
  "data": {
    "isFriend": true,
    "status": "ACCEPTED",
    "friendshipId": "123456789012345678"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 8. Remove Friend

**Endpoint:** `DELETE /users/friends/remove`

**Description:** Remove a user from friends list

**Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "userId": "987654321098765432"
}
```

**Validation Rules:**
- `userId`: Required, valid ID format

**Success Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Friend removed successfully",
  "data": {
    "id": "123456789012345678",
    "removedUserId": "987654321098765432",
    "removedAt": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## User Relations APIs

### 1. Create User Relation

**Endpoint:** `POST /users/relations`

**Description:** Block, ignore, or mute a user

**Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "targetUserId": "987654321098765432",
  "type": "BLOCKED",
  "note": "Spam user"
}
```

**Validation Rules:**
- `targetUserId`: Required, valid ID format
- `type`: Required, must be "BLOCKED", "IGNORED", or "MUTED"
- `note`: Optional, max 500 characters

**Success Response (201):**
```json
{
  "status": "success",
  "code": 201,
  "message": "User relation created successfully",
  "data": {
    "id": "123456789012345678",
    "sourceId": "123456789012345678",
    "targetId": "987654321098765432",
    "type": "BLOCKED",
    "note": "Spam user",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 2. Get User Relations

**Endpoint:** `GET /users/relations`

**Description:** Get all user relations (blocked, ignored, muted users)

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `type` (optional): Filter by relation type (BLOCKED, IGNORED, MUTED)

**Example:**
```
GET /users/relations?type=BLOCKED
```

**Success Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "message": "User relations retrieved successfully",
  "data": [
    {
      "id": "123456789012345678",
      "sourceId": "123456789012345678",
      "targetId": "987654321098765432",
      "type": "BLOCKED",
      "note": "Spam user",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "target": {
        "id": "987654321098765432",
        "username": "jane_doe",
        "globalName": "Jane Doe",
        "avatar": "https://example.com/avatar.jpg",
        "status": "ONLINE"
      }
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3. Get Blocked Users

**Endpoint:** `GET /users/relations/blocked`

**Description:** Get all blocked users

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Blocked users retrieved successfully",
  "data": [
    {
      "id": "123456789012345678",
      "sourceId": "123456789012345678",
      "targetId": "987654321098765432",
      "type": "BLOCKED",
      "note": "Spam user",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "target": {
        "id": "987654321098765432",
        "username": "jane_doe",
        "globalName": "Jane Doe",
        "avatar": "https://example.com/avatar.jpg",
        "status": "ONLINE"
      }
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 4. Get Ignored Users

**Endpoint:** `GET /users/relations/ignored`

**Description:** Get all ignored users

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Ignored users retrieved successfully",
  "data": [
    {
      "id": "123456789012345678",
      "sourceId": "123456789012345678",
      "targetId": "987654321098765432",
      "type": "IGNORED",
      "note": "Too many messages",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "target": {
        "id": "987654321098765432",
        "username": "jane_doe",
        "globalName": "Jane Doe",
        "avatar": "https://example.com/avatar.jpg",
        "status": "ONLINE"
      }
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 5. Get Muted Users

**Endpoint:** `GET /users/relations/muted`

**Description:** Get all muted users

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Muted users retrieved successfully",
  "data": [
    {
      "id": "123456789012345678",
      "sourceId": "123456789012345678",
      "targetId": "987654321098765432",
      "type": "MUTED",
      "note": "Too many notifications",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "target": {
        "id": "987654321098765432",
        "username": "jane_doe",
        "globalName": "Jane Doe",
        "avatar": "https://example.com/avatar.jpg",
        "status": "ONLINE"
      }
    }
  ],
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 6. Check User Relation

**Endpoint:** `GET /users/relations/check`

**Description:** Check relation status with another user

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Query Parameters:**
- `targetUserId`: Required, ID of the user to check relation with
- `type`: Required, relation type to check (BLOCKED, IGNORED, MUTED)

**Example:**
```
GET /users/relations/check?targetUserId=987654321098765432&type=BLOCKED
```

**Success Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "message": "User relation checked successfully",
  "data": {
    "hasRelation": true,
    "type": "BLOCKED",
    "relationId": "123456789012345678",
    "note": "Spam user"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 7. Update Relation Note

**Endpoint:** `PUT /users/relations/note`

**Description:** Update the note for a user relation

**Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "targetUserId": "987654321098765432",
  "type": "BLOCKED",
  "note": "Updated reason for blocking"
}
```

**Validation Rules:**
- `targetUserId`: Required, valid ID format
- `type`: Required, must be "BLOCKED", "IGNORED", or "MUTED"
- `note`: Required, max 500 characters

**Success Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Relation note updated successfully",
  "data": {
    "id": "123456789012345678",
    "sourceId": "123456789012345678",
    "targetId": "987654321098765432",
    "type": "BLOCKED",
    "note": "Updated reason for blocking",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 8. Remove User Relation

**Endpoint:** `DELETE /users/relations`

**Description:** Remove a user relation (unblock, unignore, unmute)

**Headers:**
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "targetUserId": "987654321098765432",
  "type": "BLOCKED"
}
```

**Validation Rules:**
- `targetUserId`: Required, valid ID format
- `type`: Required, must be "BLOCKED", "IGNORED", or "MUTED"

**Success Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "message": "User relation removed successfully",
  "data": {
    "id": "123456789012345678",
    "removedUserId": "987654321098765432",
    "removedType": "BLOCKED",
    "removedAt": "2024-01-15T10:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 9. Get Relation Stats

**Endpoint:** `GET /users/relations/stats`

**Description:** Get statistics about user relations

**Headers:**
```http
Authorization: Bearer <access_token>
```

**Success Response (200):**
```json
{
  "status": "success",
  "code": 200,
  "message": "Relation stats retrieved successfully",
  "data": {
    "blocked": 5,
    "ignored": 3,
    "muted": 2,
    "total": 10
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 500 | Internal Server Error |

### Common Error Messages

#### Authentication Errors
- `"Forbidden resource. No token provided"` - Missing Authorization header
- `"Forbidden resource. Invalid token"` - Invalid or expired token
- `"Forbidden resource. User not found or invalid"` - User not found
- `"Invalid credentials"` - Wrong email/password

#### Validation Errors
- `"Username must be at least 3 characters long"`
- `"Username can only contain letters, numbers, underscores, and dots"`
- `"Username 'admin' is reserved and cannot be used"`
- `"Email must be a valid email address"`
- `"Password must be a strong password"`
- `"User ID must be a valid ID (16-19 digits)"`

#### Business Logic Errors
- `"Username already exists"`
- `"Email already exists"`
- `"User not found"`
- `"Friendship request already exists"`
- `"Cannot send friend request to yourself"`
- `"User is already blocked"`

---

## Frontend Integration Guide

### 1. Authentication Flow

```javascript
// Register user
const registerUser = async (userData) => {
  try {
    const response = await fetch('http://localhost:3000/api/v1/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        birthdate: userData.birthdate, // Format: YYYY-MM-DD
      }),
    });

    const result = await response.json();
    
    if (result.status === 'success') {
      // Store tokens
      localStorage.setItem('accessToken', result.data.accessToken);
      localStorage.setItem('refreshToken', result.data.refreshToken);
      return result.data.user;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
};

// Login user
const loginUser = async (email, password) => {
  try {
    const response = await fetch('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();
    
    if (result.status === 'success') {
      // Store tokens
      localStorage.setItem('accessToken', result.data.accessToken);
      localStorage.setItem('refreshToken', result.data.refreshToken);
      return result.data;
    } else {
      throw new Error(result.message);
    }
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};
```

### 2. API Client Setup

```javascript
class DiscordAPI {
  constructor(baseURL = 'http://localhost:3000/api/v1') {
    this.baseURL = baseURL;
  }

  // Get authorization header
  getAuthHeader() {
    const token = localStorage.getItem('accessToken');
    return token ? `Bearer ${token}` : null;
  }

  // Make authenticated request
  async makeRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const authHeader = this.getAuthHeader();

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader && { Authorization: authHeader }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const result = await response.json();

      if (result.status === 'success') {
        return result.data;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // User Profile Methods
  async getProfile() {
    return this.makeRequest('/users/profile');
  }

  async updatePassword(currentPassword, newPassword) {
    return this.makeRequest('/users/profile/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async updateGlobalName(globalName) {
    return this.makeRequest('/users/profile/global-name', {
      method: 'PUT',
      body: JSON.stringify({ globalName }),
    });
  }

  async updateCustomStatus(customStatus) {
    return this.makeRequest('/users/profile/custom-status', {
      method: 'PUT',
      body: JSON.stringify({ customStatus }),
    });
  }

  async updateUsername(username) {
    return this.makeRequest('/users/profile/username', {
      method: 'PUT',
      body: JSON.stringify({ username }),
    });
  }

  // Friendship Methods
  async sendFriendRequest(username) {
    return this.makeRequest('/users/friends/request', {
      method: 'POST',
      body: JSON.stringify({ username }),
    });
  }

  async respondToFriendRequest(friendshipId, status) {
    return this.makeRequest('/users/friends/respond', {
      method: 'PUT',
      body: JSON.stringify({ friendshipId, status }),
    });
  }

  async getFriends(status = null) {
    const query = status ? `?status=${status}` : '';
    return this.makeRequest(`/users/friends${query}`);
  }

  async getIncomingRequests() {
    return this.makeRequest('/users/friends/requests/incoming');
  }

  async getOutgoingRequests() {
    return this.makeRequest('/users/friends/requests/outgoing');
  }

  async getMutualFriends(userId) {
    return this.makeRequest(`/users/friends/mutual/${userId}`);
  }

  async checkFriendship(userId) {
    return this.makeRequest(`/users/friends/check/${userId}`);
  }

  async removeFriend(userId) {
    return this.makeRequest('/users/friends/remove', {
      method: 'DELETE',
      body: JSON.stringify({ userId }),
    });
  }

  // User Relations Methods
  async createUserRelation(targetUserId, type, note = null) {
    return this.makeRequest('/users/relations', {
      method: 'POST',
      body: JSON.stringify({ targetUserId, type, note }),
    });
  }

  async getUserRelations(type = null) {
    const query = type ? `?type=${type}` : '';
    return this.makeRequest(`/users/relations${query}`);
  }

  async getBlockedUsers() {
    return this.makeRequest('/users/relations/blocked');
  }

  async getIgnoredUsers() {
    return this.makeRequest('/users/relations/ignored');
  }

  async getMutedUsers() {
    return this.makeRequest('/users/relations/muted');
  }

  async checkUserRelation(targetUserId, type) {
    return this.makeRequest(`/users/relations/check?targetUserId=${targetUserId}&type=${type}`);
  }

  async updateRelationNote(targetUserId, type, note) {
    return this.makeRequest('/users/relations/note', {
      method: 'PUT',
      body: JSON.stringify({ targetUserId, type, note }),
    });
  }

  async removeUserRelation(targetUserId, type) {
    return this.makeRequest('/users/relations', {
      method: 'DELETE',
      body: JSON.stringify({ targetUserId, type }),
    });
  }

  async getRelationStats() {
    return this.makeRequest('/users/relations/stats');
  }
}

// Usage
const api = new DiscordAPI();

// Example usage
try {
  const profile = await api.getProfile();
  console.log('User profile:', profile);

  const friends = await api.getFriends();
  console.log('Friends list:', friends);

  const blockedUsers = await api.getBlockedUsers();
  console.log('Blocked users:', blockedUsers);
} catch (error) {
  console.error('Error:', error.message);
}
```

### 3. Form Validation (Frontend)

```javascript
// Username validation
const validateUsername = (username) => {
  const errors = [];
  
  if (!username) {
    errors.push('Username is required');
  } else if (username.length < 3) {
    errors.push('Username must be at least 3 characters long');
  } else if (username.length > 32) {
    errors.push('Username must not exceed 32 characters');
  } else if (!/^[a-zA-Z0-9._]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, underscores, and dots');
  } else if (['admin', 'support', 'discord', 'system'].includes(username.toLowerCase())) {
    errors.push(`Username '${username}' is reserved and cannot be used`);
  }
  
  return errors;
};

// Email validation
const validateEmail = (email) => {
  const errors = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!email) {
    errors.push('Email is required');
  } else if (!emailRegex.test(email)) {
    errors.push('Email must be a valid email address');
  }
  
  return errors;
};

// Password validation
const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    errors.push('Password is required');
  } else if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  } else if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  } else if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  } else if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  } else if (!/(?=.*[@$!%*?&])/.test(password)) {
    errors.push('Password must contain at least one special character');
  }
  
  return errors;
};

// User ID validation
const validateUserId = (userId) => {
  const errors = [];
  
  if (!userId) {
    errors.push('User ID is required');
  } else if (!/^\d{16,19}$/.test(userId)) {
    errors.push('User ID must be a valid ID (16-19 digits)');
  }
  
  return errors;
};

// Date validation
const validateBirthdate = (birthdate) => {
  const errors = [];
  
  if (!birthdate) {
    errors.push('Birthdate is required');
  } else {
    const date = new Date(birthdate);
    const today = new Date();
    
    if (isNaN(date.getTime())) {
      errors.push('Birthdate must be a valid date');
    } else if (date >= today) {
      errors.push('Birthdate must be in the past');
    } else {
      const age = today.getFullYear() - date.getFullYear();
      if (age < 13) {
        errors.push('You must be at least 13 years old');
      }
    }
  }
  
  return errors;
};
```

### 4. Error Handling

```javascript
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        // Unauthorized - redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        break;
      case 422:
        // Validation errors
        if (data.errors) {
          data.errors.forEach(err => {
            console.error(`${err.field}: ${err.message}`);
          });
        }
        break;
      case 409:
        // Conflict - show specific message
        alert(data.message);
        break;
      default:
        alert(data.message || 'An error occurred');
    }
  } else if (error.request) {
    // Network error
    alert('Network error. Please check your connection.');
  } else {
    // Other error
    alert(error.message || 'An unexpected error occurred');
  }
};
```

### 5. React Hook Example

```javascript
import { useState, useEffect } from 'react';

const useDiscordAPI = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const api = new DiscordAPI();

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.loginUser(email, password);
      const profile = await api.getProfile();
      setUser(profile);
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('accessToken');
    if (token) {
      api.getProfile()
        .then(profile => setUser(profile))
        .catch(() => logout());
    }
  }, []);

  return {
    user,
    loading,
    error,
    login,
    logout,
    api,
  };
};

export default useDiscordAPI;
```

---

## Summary

This Discord Clone API provides:

✅ **Complete Authentication System**
- User registration with validation
- JWT-based authentication
- Password management

✅ **User Profile Management**
- Profile information retrieval
- Username, global name, custom status updates
- Password changes

✅ **Friendship System**
- Send/accept/reject friend requests
- Friends list management
- Mutual friends discovery
- Friendship status checking

✅ **User Relations**
- Block, ignore, mute users
- Relation management with notes
- Statistics and filtering

✅ **Comprehensive Validation**
- Username format validation
- Email validation
- Password strength requirements
- User ID format validation
- Date validation

✅ **Frontend Integration Ready**
- Complete API client class
- Form validation functions
- Error handling patterns
- React hooks example

The API is designed to be simple, consistent, and easy to integrate with any frontend framework. All endpoints follow RESTful conventions and return consistent response formats.
