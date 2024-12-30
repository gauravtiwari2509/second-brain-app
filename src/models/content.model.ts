import { model, Schema } from "mongoose";

const contentTypes: ContentType[] = [
  "image",
  "video",
  "article",
  "audio",
  "document",
  "tweet",
  "other",
];

const contentSchema = new Schema<IContent>(
  {
    link: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: contentTypes,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
export const ContentModel = model<IContent>("content", contentSchema);
