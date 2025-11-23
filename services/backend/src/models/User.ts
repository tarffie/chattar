import mongoose, { Schema, Document } from "mongoose";
import type { User } from "../../../../shared/types/index";

export interface IUser extends Document, Omit<User, "id"> {
  password: string;
}

/**
 * Represents a registered device for a user account.
 * Each device has its own key pair for end-to-end encryption.
 */
const DeviceKeySchema = new Schema(
  {
    publicKey: { type: String, required: true },
    deviceId: { type: String, required: true },
    addedAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false },
);

/**
 * User model for authentication and account management
 */
const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    publicKey: { type: String, required: true },
    deviceKeys: { type: [DeviceKeySchema], default: [] },
    status: {
      type: String,
      enum: ["online", "offline", "busy"],
      default: "offline",
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

export default mongoose.model<IUser>("User", UserSchema);
