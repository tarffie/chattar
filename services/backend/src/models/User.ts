import mongoose, { Schema, Document, type HydratedDocument } from "mongoose";
import type { User } from "../../../../shared/types/index";

export interface IUser extends Document, Omit<User, "id"> {
  password: string;
}

const UserSchema: Schema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    publicKey: { type: String, required: true },
    status: {
      type: String,
      enum: ["online", "offline", "away"],
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
