import { Schema, model } from "mongoose";
const linkSchema = new Schema<ILink>(
  {
    hash: {
      type: String,
      unique: true,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
export const LinkModel = model<ILink>("Link", linkSchema);
