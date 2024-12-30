import { UserModel } from "../models/user.model";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { Request, Response, NextFunction } from "express";

const verifyJwt = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
    if (!ACCESS_TOKEN_SECRET) {
      throw new Error(
        "ACCESS_TOKEN_SECRET is not defined in environment variables"
      );
    }

    const token: string | undefined =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decodedToken: any = jwt.verify(token, ACCESS_TOKEN_SECRET);

    const user: IUser | null = await UserModel.findById(
      decodedToken?._id
    ).select("-password");

    if (!user) {
      return res.status(401).json({ message: "User not found jwt" });
    }

    req.user = user;

    next();
  } catch (err: any) {
    return res
      .status(401)
      .json({ message: "Invalid or expired token", error: err.message });
  }
};

export { verifyJwt };
