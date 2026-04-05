import { verifyToken } from "../utils/token.service.js";
import * as db_service from "./../../DB/db.service.js";
import userModel from "../../DB/models/user.model.js";
import revokeTokenModel from "../../DB/models/revokeToken.model.js";
import { get, revoked_key } from "../../DB/redis/redis.service.js";

export const authentication = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    throw new Error("token not exist");
  }

  const [prefix, token] = authorization.split(" ");
  if (prefix !== "bearer") {
    throw new Error("invalid token prefix");
  }

  const decoded = verifyToken({ token: token, secret_key: "key" });

  if (!decoded || !decoded?.id) {
    throw new Error("invalid token");
  }
  const user = await db_service.findOne({
    model: userModel,
    filter: { _id: decoded.id },
    // select: "-password",
  });

  if (!user) {
    throw new Error("user not exist", { cause: 404 });
  }

  if (user?.changeCredential?.getTime() > decoded.iat * 1000) {
    throw new Error("invalid token");
  }
  const revokeToken = await get({
    key: revoked_key({ userId: user._id, jti: decoded.jti }),
  });
  if (revokeToken) {
    throw new Error("invalid token revoked");
  }

  req.user = user;
  req.decoded = decoded;
  next();
};
