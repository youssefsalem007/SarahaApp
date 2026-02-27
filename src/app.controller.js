import express from "express";
import checkConnectionDB from "./DB/connectionDB.js";
import userRouter from "./modules/users/user.controller.js";
import cors from "cors";
import { PORT } from "../config/config.service.js";
const app = express();
const port = PORT;

const bootstrap = () => {
  app.use(cors(), express.json());

  app.get("/", (req, res, next) => {
    res.status(200).json({ message: "welcome to saraha app" });
  });

  checkConnectionDB();

  app.use("/users", userRouter);

  app.use("/*demo", (req, res, next) => {
    throw new Error(`invalid url ${req.originalUrl}`, { cause: 404 });
  });
  app.use((err, req, res, next) => {
    res
      .status(err.cause || 500)
      .json({ message: err.message, stack: err.stack });
  });

  app.listen(port, () => {
    console.log(`server is running on port ${port}`);
  });
};
export default bootstrap;
