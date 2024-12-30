"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkModel = void 0;
const mongoose_1 = require("mongoose");
const linkSchema = new mongoose_1.Schema({
    hash: {
        type: String,
        unique: true,
        required: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        unique: true,
        required: true,
    },
}, {
    timestamps: true,
});
exports.LinkModel = (0, mongoose_1.model)("Link", linkSchema);
