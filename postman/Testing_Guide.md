# Discord Clone API - Testing Guide

## 🎯 Overview
This guide explains how to test the Discord Clone API using 3 separate Postman collections for comprehensive testing scenarios.

## 👥 Test Users

### User 1 - Alice (Main User)
- **Username**: `alice_dev`
- **Email**: `alice@discordclone.com`
- **Password**: `alice123456`
- **Phone**: `+1234567890`
- **Global Name**: `Alice Johnson`
- **Custom Status**: `Working on Discord Clone`
- **Role**: Primary tester, sends friend requests

### User 2 - Bob (Friend User)
- **Username**: `bob_dev`
- **Email**: `bob@discordclone.com`
- **Password**: `bob123456`
- **Phone**: `+1234567891`
- **Global Name**: `Bob Smith`
- **Custom Status**: `Testing Discord Clone API`
- **Role**: Accepts friend requests, mutual friend

### User 3 - Charlie (Third User)
- **Username**: `charlie_dev`
- **Email**: `charlie@discordclone.com`
- **Password**: `charlie123456`
- **Phone**: `+1234567892`
- **Global Name**: `Charlie Brown`
- **Custom Status**: `Learning Discord Clone Development`
- **Role**: Mutual friend, advanced testing

## 🚀 Testing Workflow

### Phase 1: User Registration & Authentication
1. **Alice Registration**
   - Import `User1_Alice.postman_collection.json`
   - Import `User1_Alice.postman_environment.json`
   - Run "Register Alice" request
   - Verify token is saved automatically

2. **Bob Registration**
   - Import `User2_Bob.postman_collection.json`
   - Import `User2_Bob.postman_environment.json`
   - Run "Register Bob" request
   - Verify token is saved automatically

3. **Charlie Registration**
   - Import `User3_Charlie.postman_collection.json`
   - Import `User3_Charlie.postman_environment.json`
   - Run "Register Charlie" request
   - Verify token is saved automatically

### Phase 2: Profile Management Testing
1. **Alice Profile Updates**
   - Update global name to "Alice Johnson"
   - Update custom status to "Working on Discord Clone"
   - Verify profile data is updated

2. **Bob Profile Updates**
   - Update global name to "Bob Smith"
   - Update custom status to "Testing Discord Clone API"
   - Verify profile data is updated

3. **Charlie Profile Updates**
   - Update global name to "Charlie Brown"
   - Update custom status to "Learning Discord Clone Development"
   - Verify profile data is updated

### Phase 3: Friendship Management Testing
1. **Alice Sends Friend Requests**
   - Send friend request to Bob
   - Send friend request to Charlie
   - Verify requests are sent successfully

2. **Bob Accepts Alice's Request**
   - Check incoming requests
   - Accept Alice's friend request
   - Verify friendship is established

3. **Charlie Accepts Alice's Request**
   - Check incoming requests
   - Accept Alice's friend request
   - Verify friendship is established

4. **Bob Sends Request to Charlie**
   - Bob sends friend request to Charlie
   - Verify request is sent

5. **Charlie Accepts Bob's Request**
   - Charlie accepts Bob's friend request
   - Verify mutual friendship is established

### Phase 4: Advanced Features Testing
1. **Friends Lists Verification**
   - Check Alice's friends list (should include Bob and Charlie)
   - Check Bob's friends list (should include Alice and Charlie)
   - Check Charlie's friends list (should include Alice and Bob)

2. **Mutual Friends Testing**
   - Alice checks mutual friends with Bob (should show Charlie)
   - Bob checks mutual friends with Alice (should show Charlie)
   - Charlie checks mutual friends with Alice (should show Bob)

3. **Friendship Status Checking**
   - Verify all friendship statuses are correct
   - Test friendship status between all user pairs

## 📋 Test Scenarios

### Scenario 1: Complete Friendship Flow
```
Alice → Bob (Friend Request) → Bob Accepts → Alice ↔ Bob (Friends)
Alice → Charlie (Friend Request) → Charlie Accepts → Alice ↔ Charlie (Friends)
Bob → Charlie (Friend Request) → Charlie Accepts → Bob ↔ Charlie (Friends)
Result: All three users are mutual friends
```

### Scenario 2: Profile Updates
```
Alice: Global Name = "Alice Johnson", Status = "Working on Discord Clone"
Bob: Global Name = "Bob Smith", Status = "Testing Discord Clone API"
Charlie: Global Name = "Charlie Brown", Status = "Learning Discord Clone Development"
```

### Scenario 3: Mutual Friends Discovery
```
Alice ↔ Bob ↔ Charlie (All are friends)
Alice checks mutual friends with Bob → Shows Charlie
Bob checks mutual friends with Alice → Shows Charlie
Charlie checks mutual friends with Alice → Shows Bob
```

## 🔧 Collection Structure

### Main Collection (Complete API)
- **Health Check** - API health monitoring
- **Authentication** - Login/Register
- **User Profile** - Profile management
- **Friends Management** - All friendship operations
- **Friends Discovery** - Mutual friends and status checks

### User-Specific Collections
- **User1_Alice** - Main user operations
- **User2_Bob** - Friend user operations
- **User3_Charlie** - Third user operations

## 🎨 Environment Variables

Each user has their own environment with:
- `baseUrl`: API base URL
- `accessToken`: Auto-managed authentication token
- `userId`: Auto-extracted user ID
- `friendshipId`: Auto-extracted friendship ID
- User-specific data (username, email, etc.)

## 🚨 Error Testing

### Invalid Credentials
- Test login with wrong password
- Test registration with existing email
- Test friend request to non-existent user

### Authorization Testing
- Test protected endpoints without token
- Test with expired/invalid token
- Test cross-user data access

### Validation Testing
- Test profile updates with invalid data
- Test friend requests with invalid usernames
- Test password updates with weak passwords

## 📊 Expected Results

### After Complete Testing:
1. **3 Users Registered** ✅
2. **All Profiles Updated** ✅
3. **Alice ↔ Bob (Friends)** ✅
4. **Alice ↔ Charlie (Friends)** ✅
5. **Bob ↔ Charlie (Friends)** ✅
6. **Mutual Friends Working** ✅
7. **All API Endpoints Tested** ✅

## 🔄 Maintenance

### Regular Testing:
- Run health checks before testing
- Clear tokens between test sessions
- Verify data consistency across users
- Test error scenarios

### Data Cleanup:
- Remove test friendships if needed
- Reset profile data if required
- Clear test user accounts if necessary

## 📞 Troubleshooting

### Common Issues:
1. **Token Not Saved**: Check test scripts in requests
2. **Friendship Not Created**: Verify user IDs are correct
3. **Profile Not Updated**: Check authorization headers
4. **Mutual Friends Empty**: Ensure all users are friends

### Debug Steps:
1. Check console logs in Postman
2. Verify environment variables
3. Check API response status codes
4. Validate request/response data

---

**Happy Testing! 🚀**

This comprehensive testing setup ensures all Discord Clone API features work correctly across multiple users and scenarios.
