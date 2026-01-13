export const RESPONSE_MESSAGES = {
  USER: {
    PROFILE_FETCHED: { code: 'USER_PROFILE_FETCHED', message: 'User profile fetched successfully' },
    PASSWORD_UPDATED: { code: 'USER_PASSWORD_UPDATED', message: 'Password updated successfully' },
    GLOBALNAME_UPDATED: { code: 'USER_GLOBALNAME_UPDATED', message: 'Global name updated successfully' },
    CUSTOM_STATUS_UPDATED: { code: 'USER_CUSTOM_STATUS_UPDATED', message: 'Custom status updated successfully' },
    USERNAME_UPDATED: { code: 'USER_USERNAME_UPDATED', message: 'Username updated successfully' },
    NOT_FOUND: { code: 'USER_NOT_FOUND', message: 'User not found' },
  },
  AUTH: {
    USER_CREATED: { code: 'USER_CREATED', message: 'User created successfully' },
    LOGIN_SUCCESS: { code: 'LOGIN_SUCCESS', message: 'Logged in successfully' },
    INVALID_CREDENTIALS: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' },
    UNAUTHORIZED: { code: 'UNAUTHORIZED', message: 'Unauthorized access' },
  },
  PRESENCE: {
    STATUS_UPDATED: { code: 'PRESENCE_STATUS_UPDATED', message: 'Presence status updated successfully' },
  },
  FRIEND: {
    REQUEST_SENT: { code: 'FRIEND_REQUEST_SENT', message: 'Friend request sent successfully' },
    REQUEST_ACCEPTED: { code: 'FRIEND_REQUEST_ACCEPTED', message: 'Friend request accepted successfully' },
    REQUEST_REJECTED: { code: 'FRIEND_REQUEST_REJECTED', message: 'Friend request rejected successfully' },
    REQUEST_CANCELLED: { code: 'FRIEND_REQUEST_CANCELLED', message: 'Friend request cancelled successfully' },
    REMOVED: { code: 'FRIEND_REMOVED', message: 'Friend removed successfully' },
    LIST_FETCHED: { code: 'FRIENDS_FETCHED', message: 'Friends list fetched successfully' },
    REQUESTS_FETCHED: { code: 'REQUESTS_FETCHED', message: 'Friends requests fetched successfully' },
    MUTUAL_FETCHED: { code: 'MUTUAL_FRIENDS_FETCHED', message: 'Mutual friends fetched successfully' },
  },
  RELATION: {
    CREATED_OR_UPDATED: { code: 'RELATION_SAVED', message: 'Relation saved successfully' },
    REMOVED: { code: 'RELATION_REMOVED', message: 'Relation removed successfully' },
    LIST_FETCHED: { code: 'RELATIONS_FETCHED', message: 'Relations fetched successfully' },
    BLOCKED_FETCHED: { code: 'BLOCKED_USERS_FETCHED', message: 'Blocked users fetched successfully' },
    IGNORED_FETCHED: { code: 'IGNORED_USERS_FETCHED', message: 'Ignored users fetched successfully' },
    MUTED_FETCHED: { code: 'MUTED_USERS_FETCHED', message: 'Muted users fetched successfully' },
    NOTE_UPDATED: { code: 'RELATION_NOTE_UPDATED', message: 'Relation note updated successfully' },
    STATS_FETCHED: { code: 'RELATION_STATS_FETCHED', message: 'Relation stats fetched successfully' },
  },
  DM: {
    CREATED: { code: 'DM_CREATED', message: 'DM created successfully' },
    FETCHED: { code: 'DM_FETCHED', message: 'DM fetched successfully' },
  },
  SERVER: {
    ERROR: { code: 'SERVER_ERROR', message: 'Internal server error' },
  },

} as const;


