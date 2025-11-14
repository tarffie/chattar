export interface User {
  id: string;
  username: string;
  publicKey: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  from: string;
  to: string;
  encryptedContent: string;
  timestamp: number;
  delivered: boolean;
}

export interface Contact {
  userId: string;
  contactId: string;
  publicKey: string;
  addedAt: Date;
}

export interface PresenceStatus {
  userId: string;
  online: boolean;
  lastSeen?: Date;
}

  
