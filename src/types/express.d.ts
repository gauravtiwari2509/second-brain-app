import { Document } from "mongoose";

declare global {
  interface IUser extends Document {
    _id: mongoose.type.ObjectId;
    username: string;
    password: string;
    refreshToken?: string;
    isPasswordCorrect(password: string): Promise<boolean>;
    generateAccessToken(): string;
    generateRefreshToken(): string;
  }

  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
  type ContentType =
    | "image"
    | "video"
    | "article"
    | "audio"
    | "document"
    | "tweet"
    | "other";
  interface IContent extends Document {
    _id: mongoose.type.ObjectId;
    link: string;
    type: ContentType;
    title: string;
    tags: Types.ObjectId[];
    userId: Types.ObjectId;
  }

  interface ITag extends Document {
    title: string;
  }

  interface ILink extends Document {
    _id: mongoose.type.ObjectId;
    hash: string;
    userId: Types.ObjectId;
  }
}

export {};
