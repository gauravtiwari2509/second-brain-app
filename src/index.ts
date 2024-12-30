import dotenv from "dotenv";
import dbConnect from "./db/dbConnect";
import { app } from "./app";
dotenv.config({
  path: "./.env",
});

dbConnect()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`server is running at port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("mongoDB connection failed " + err);
  });
