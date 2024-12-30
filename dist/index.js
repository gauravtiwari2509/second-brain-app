"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const dbConnect_1 = __importDefault(require("./db/dbConnect"));
const app_1 = require("./app");
dotenv_1.default.config({
    path: "./.env",
});
(0, dbConnect_1.default)()
    .then(() => {
    app_1.app.listen(process.env.PORT, () => {
        console.log(`server is running at port ${process.env.PORT}`);
    });
})
    .catch((err) => {
    console.log("mongoDB connection failed " + err);
});
