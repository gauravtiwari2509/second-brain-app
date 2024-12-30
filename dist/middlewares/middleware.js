"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJwt = void 0;
const user_model_1 = require("../models/user.model");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
require("dotenv/config");
const verifyJwt = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
        if (!ACCESS_TOKEN_SECRET) {
            throw new Error("ACCESS_TOKEN_SECRET is not defined in environment variables");
        }
        const token = ((_a = req.cookies) === null || _a === void 0 ? void 0 : _a.accessToken) ||
            ((_b = req.header("Authorization")) === null || _b === void 0 ? void 0 : _b.replace("Bearer ", ""));
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }
        const decodedToken = jsonwebtoken_1.default.verify(token, ACCESS_TOKEN_SECRET);
        const user = yield user_model_1.UserModel.findById(decodedToken === null || decodedToken === void 0 ? void 0 : decodedToken._id).select("-password");
        if (!user) {
            return res.status(401).json({ message: "User not found jwt" });
        }
        req.user = user;
        next();
    }
    catch (err) {
        return res
            .status(401)
            .json({ message: "Invalid or expired token", error: err.message });
    }
});
exports.verifyJwt = verifyJwt;
