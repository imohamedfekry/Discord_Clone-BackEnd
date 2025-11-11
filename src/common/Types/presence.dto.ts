import { UserStatus } from '@prisma/client';

export interface UserPresenceDto {
  userId: string;
  status: UserStatus; // ONLINE | IDLE | DND | Invisible (treated as OFFLINE when not connected)
  lastSeen?: string | null; // ISO string if available
}


