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
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const user_model_1 = require("./models/user.model");
const content_model_1 = require("./models/content.model");
const middleware_1 = require("./middlewares/middleware");
const tag_model_1 = require("./models/tag.model");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const link_model_1 = require("./models/link.model");
const app = (0, express_1.default)();
exports.app = app;
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));
// required functions
const generateAccessAndRefreshToken = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_model_1.UserModel.findById(userId);
        if (!user) {
            throw new Error("User not found");
        }
        const accessToken = user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        yield user.save({ validateBeforeSave: false });
        return { accessToken, refreshToken };
    }
    catch (err) {
        // console.error(err);
        throw new Error("Problem generating access and refresh tokens");
    }
});
//routes declaration
app.get('/', (req, res) => {
    res.send("hi");
});
app.post("/api/v1/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password are required",
            });
        }
        const existingUser = yield user_model_1.UserModel.findOne({ username });
        if (existingUser) {
            return res.status(400).json({
                message: "Username already taken",
            });
        }
        const user = new user_model_1.UserModel({
            username,
            password,
        });
        yield user.save();
        const { accessToken, refreshToken } = yield generateAccessAndRefreshToken(user._id);
        return res
            .cookie("accessToken", accessToken, {
            httpOnly: true,
            sameSite: "strict",
        })
            .cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "strict",
        })
            .status(200)
            .json({
            message: "User successfully signed in",
            accessToken,
            refreshToken,
        });
    }
    catch (error) {
        // console.error("Signup error:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message || "Something went wrong.",
        });
    }
}));
app.post("/api/v1/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password are required",
            });
        }
        const existingUser = yield user_model_1.UserModel.findOne({ username });
        if (!existingUser) {
            return res.status(400).json({
                message: "no user found",
            });
        }
        const isPasswordValid = yield existingUser.isPasswordCorrect(password);
        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Incorrect password",
            });
        }
        const { accessToken, refreshToken } = yield generateAccessAndRefreshToken(existingUser._id);
        return res
            .cookie("accessToken", accessToken, {
            httpOnly: true,
            sameSite: "strict",
        })
            .cookie("refreshToken", refreshToken, {
            httpOnly: true,
            sameSite: "strict",
        })
            .status(200)
            .json({
            message: "User successfully signed in",
            accessToken,
            refreshToken,
        });
    }
    catch (error) {
        // console.error("Signin error:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message || "Something went wrong.",
        });
    }
}));
app.post("/api/v1/logout", middleware_1.verifyJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user } = req;
        if (user) {
            yield user_model_1.UserModel.findByIdAndUpdate(user._id, {
                $unset: { refreshToken: "" },
            });
        }
        res
            .clearCookie("accessToken", {
            httpOnly: true,
            sameSite: "strict",
        })
            .clearCookie("refreshToken", {
            httpOnly: true,
            sameSite: "strict",
        });
        return res.status(200).json({
            message: "User successfully logged out",
        });
    }
    catch (error) {
        // console.error("Logout error:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message || "Something went wrong.",
        });
    }
}));
app.post("/api/v1/content", middleware_1.verifyJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { link, type, title, tags } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (!link || !type || !title || !tags) {
            return res.status(400).json({
                message: "all field required",
            });
        }
        const validContentTypes = [
            "image",
            "video",
            "article",
            "audio",
            "document",
            "tweet",
            "other",
        ];
        if (!validContentTypes.includes(type)) {
            return res.status(400).json({
                message: "Invalid content type",
            });
        }
        const tagDocuments = yield Promise.all(tags.map((tagName) => __awaiter(void 0, void 0, void 0, function* () {
            let tag = yield tag_model_1.TagModel.findOne({ title: tagName });
            if (!tag) {
                tag = new tag_model_1.TagModel({ title: tagName });
                yield tag.save();
            }
            return tag._id;
        })));
        content_model_1.ContentModel.create({
            link,
            type,
            title,
            tags: tagDocuments,
            userId,
        });
        res.status(200).json({
            message: "content created successfully",
        });
    }
    catch (error) {
        // console.error("content creation error:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message || "Something went wrong.",
        });
    }
}));
app.get("/api/v1/content", middleware_1.verifyJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a._id;
        const content = yield content_model_1.ContentModel.find({ userId })
            .populate({
            path: "userId",
            model: "User",
            select: "-password -refreshToken",
        })
            .populate({
            path: "tags",
            model: "Tag",
            select: "-createdAt -updatedAt",
        })
            .sort({ createdAt: -1 });
        if (content.length === 0) {
            return res.status(200).json({
                data: [],
                message: "no content found",
            });
        }
        res.status(200).json({
            data: content,
            message: `${content.length} content found`,
        });
    }
    catch (error) {
        // console.log("error occured while fetching content", error);
        res.status(500).json({
            message: error.message || "internal server error",
        });
    }
}));
app.delete("/api/v1/content/:contentId", middleware_1.verifyJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { contentId } = req.params;
        if (!contentId) {
            return res.status(400).json({ message: "Content ID is required" });
        }
        const content = yield content_model_1.ContentModel.findById(contentId);
        if (!content) {
            return res.status(404).json({ message: "Content not found" });
        }
        // Ensuring the content belongs to the authenticated user
        if (content.userId.toString() !== ((_a = req.user) === null || _a === void 0 ? void 0 : _a._id.toString())) {
            return res.status(403).json({
                message: "You do not have permission to delete this content",
            });
        }
        yield content.deleteOne();
        res.status(200).json({ message: "Content deleted successfully" });
    }
    catch (error) {
        // console.log("Error occurred while deleting content:", error);
        res
            .status(500)
            .json({ message: error.message || "Internal server error" });
    }
}));
function generateCharacterHash() {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < 9; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters[randomIndex];
    }
    return result;
}
app.post("/api/v1/brain/share", middleware_1.verifyJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // first request aane pe check karenge ki wo user already koyi link generate kiya hai ya nhi agar kiya hai toh return same link
    // agar nhi hai toh fir ek naya link create kar ke send kar denge
    try {
        const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a._id;
        const existingLink = yield link_model_1.LinkModel.findOne({ userId });
        if (existingLink) {
            return res
                .status(200)
                .json({ message: "link already exist", data: existingLink.hash });
        }
        const hash = generateCharacterHash();
        const newLink = new link_model_1.LinkModel({ hash, userId });
        yield newLink.save();
        return res.status(200).json({
            data: hash,
            message: "link generated successfully",
        });
    }
    catch (error) {
        if ((error === null || error === void 0 ? void 0 : error.code) === 11000) {
            return res
                .status(400)
                .json({ message: "Hash already exists, try again." });
        }
        else {
            return res
                .status(500)
                .json({ message: "Internal server Error, try again later." });
        }
    }
}));
app.get("/api/v1/brain/share", middleware_1.verifyJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a._id;
        const existingLink = yield link_model_1.LinkModel.findOne({ userId });
        if (!existingLink) {
            return res.status(204).json({ message: "No link found for this user" });
        }
        return res
            .status(200)
            .json({ message: "link found", data: existingLink.hash });
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Internal server Error, try again later." });
    }
}));
app.delete("/api/v1/brain/share", middleware_1.verifyJwt, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req === null || req === void 0 ? void 0 : req.user) === null || _a === void 0 ? void 0 : _a._id;
        const existingLink = yield link_model_1.LinkModel.findOne({ userId });
        if (!existingLink) {
            return res.status(404).json({ message: "No link found to delete" });
        }
        yield link_model_1.LinkModel.deleteOne({ userId });
        return res.status(200).json({ message: "Link deleted successfully" });
    }
    catch (error) {
        return res
            .status(500)
            .json({ message: "Internal server error, try again later." });
    }
}));
app.get("/api/v1/brain/:shareLink", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const hash = req.params.shareLink;
        const link = yield link_model_1.LinkModel.findOne({ hash });
        if (!link) {
            return res.status(404).json({ message: "Link not found" });
        }
        const contentUser = link.userId;
        const content = yield content_model_1.ContentModel.find({
            userId: contentUser,
        })
            .populate({
            path: "userId",
            model: "User",
            select: "username -_id",
        })
            .populate({
            path: "tags",
            model: "Tag",
            select: "-createdAt -updatedAt -_id ",
        });
        if (!content || content.length === 0) {
            return res
                .status(200)
                .json({ message: "No content available for this user" });
        }
        return res.status(200).json({
            data: content,
            message: "Content fetched successfully",
        });
    }
    catch (error) {
        // console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
}));
app.post("/api/v1/refresh", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { refreshToken } = req.cookies;
        const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
        if (!REFRESH_TOKEN_SECRET) {
            // console.log("no refresh token scret found");
            return;
        }
        if (!refreshToken) {
            return res.status(401).json({ message: "Refresh token is missing" });
        }
        const decoded = jsonwebtoken_1.default.verify(refreshToken, REFRESH_TOKEN_SECRET);
        const user = yield user_model_1.UserModel.findById(decoded._id);
        if (!user) {
            return res.status(401).json({ message: "Invalid refresh token" });
        }
        const { accessToken, refreshToken: newRefreshToken } = yield generateAccessAndRefreshToken(user._id);
        return res
            .cookie("accessToken", accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 15 * 60 * 1000,
        })
            .cookie("refreshToken", newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        })
            .json({ message: "Tokens refreshed successfully" });
    }
    catch (err) {
        return res.status(401).json({
            message: "Invalid or expired refresh token",
            error: err.message,
        });
    }
}));
