export interface SocketMetadata {
  device?: string;
  connectedAt: Date;
  ip?: string;
  userAgent?: string;
  lastPing?: Date;
}

export enum PresenceStatus {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  IDLE = 'IDLE',
  DND = 'DND',
}
