"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContentModel = void 0;
const mongoose_1 = require("mongoose");
const contentTypes = [
    "image",
    "video",
    "article",
    "audio",
    "document",
    "tweet",
    "other",
];
const contentSchema = new mongoose_1.Schema({
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
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "Tag",
        },
    ],
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
}, {
    timestamps: true,
});
exports.ContentModel = (0, mongoose_1.model)("content", contentSchema);
