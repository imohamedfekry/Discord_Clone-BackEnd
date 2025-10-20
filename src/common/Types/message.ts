// types/message.ts

export type Mention = {
    id: bigint | string;       // ID of user
    type: "user";
  };
  
  export type MentionRole = {
    id: bigint | string;       // ID of role
    type: "role";
  };
  
  export type Reaction = {
    emoji: string;
    count: number;
    users: (bigint | string)[];  // IDs of users who reacted
  };
  
  export type Attachment = {
    url: string;
    type: "image" | "file" | "video" | "audio";
    size?: number;        // in bytes
    name?: string;        // original file name
  };
  
  // The main Message type
  export type MessageDTO = {
    id: bigint | string;
    conversationId?: bigint | string;
    senderId: bigint | string;
    receiverId?: bigint | string;
  
    content?: string;
    type: "TEXT" | "IMAGE" | "FILE" | "SYSTEM" | "REPLY" | "VOICE";
  
    mentionEveryone: boolean;
    mentions?: Mention[];
    mentionRoles?: MentionRole[];
  
    pinned: boolean;
    reactions?: Reaction[];
    attachments?: Attachment[];
  
    replyTo?: bigint | string;
  
    editedAt?: Date;
    deletedAt?: Date;
    createdAt: Date;
  };  