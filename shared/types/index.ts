export interface User {
  id: string;
  username: string;
  email?: string;
  publicKey: string;
  deviceKeys?: Array<{
    publicKey: string;
    deviceId: string;
    addedAt: Date;
  }>;
  status: "online" | "offline" | "busy";
  createdAt: Date;
}

export interface RefreshToken {
  userId: string;
  token: string;
  expiresAt?: Date;
  deviceInfo?: string;
  ipAddress?: string;
  createdAt?: Date;
  lastUsedAt?: Date;
}

export interface CreateUserPayload {
  username: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
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

export type RegisterInputSchema = {
  username: string;
  password: string;
  email: string;
  publicKey: string;
};

export type LoginInputSchema = {
  identification: string;
  password: string;
};
