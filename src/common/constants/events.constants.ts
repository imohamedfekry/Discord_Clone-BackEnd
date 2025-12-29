export const Events = {
  // Presence lifecycle
  PRESENCE_UPDATE: 'PRESENCE_UPDATE',
  INITIAL_PRESENCE_SYNC: 'INITIAL_PRESENCE_SYNC',

  // User connection lifecycle
  CONNECTED: 'CONNECTED',
  DISCONNECTED: 'DISCONNECTED',
  READY: 'READY',
  // Guild / DM bootstrap
  GUILD_INIT: 'GUILD_INIT',
  DM_INIT: 'DM_INIT',

  // Messaging
  MESSAGE_CREATE: 'MESSAGE_CREATE',
} as const;

export type EventName = typeof Events[keyof typeof Events];


