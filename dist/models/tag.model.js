"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TagModel = void 0;
const mongoose_1 = require("mongoose");
const tagSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
    },
}, {
    timestamps: true,
});
exports.TagModel = (0, mongoose_1.model)("Tag", tagSchema);
