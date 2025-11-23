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

/**
 * Schema for refresh token used to stabilish and keep connections alive
 */
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
  },
  expiresAt: {
    type: Date,
    required: true,
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

RefreshTokenSchema.index(
  { token: 1 },
  {
    unique: true,
    partialFilterExpression: { expiresAt: { $gte: new Date() } },
  },
);

RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

RefreshTokenSchema.index({ userId: 1, token: 1 });
export default mongoose.model<IRefreshToken>(
  "RefreshToken",
  RefreshTokenSchema,
);
