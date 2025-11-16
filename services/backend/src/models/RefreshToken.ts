import mongoose, { Schema, Document } from "mongoose";
import type { RefreshToken } from "../../../../shared/types/index";
import type { ObjectId } from "mongoose";

export interface IRefreshToken extends Document, Omit<RefreshToken, "userId"> {
  userId: ObjectId;
  expiresAt: Date;
  deviceInfo?: string;
  ipAddress?: string;
  createdAt: Date;
  lastUsedAt: Date;
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: true,
  },
  deviceInfo: {
    type: String,
  },
  ipAddress: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  lastUsedAt: {
    type: Date,
    default: Date.now,
  },
});

RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model<IRefreshToken>(
  "RefreshToken",
  RefreshTokenSchema,
);
