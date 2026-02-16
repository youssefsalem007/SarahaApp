import { ProviderEnum } from "../common/enum/user.enum.js";
import { successResponse } from "../common/utils/response.success.js";
import { decrypt, encrypt } from "../common/utils/security/encrypt.security.js";
import { GenerateToken, verifyToken } from "../common/utils/token.service.js";
import * as db_service from "../DB/db.service.js";
import userModel from "../DB/models/user.model.js";
import { hash, compare } from "./../common/utils/security/hash.security.js";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

export const signUp = async (req, res, next) => {
  const { userName, email, password, cPassword, age, gender, phone } = req.body;
  if (password !== cPassword) {
    throw new Error("invalid password", { cause: 400 });
  }

  if (await db_service.findOne({ model: userModel, filter: { email } })) {
    throw new Error("email already exist", { cause: 409 });
  }
  const user = await db_service.create({
    model: userModel,
    data: {
      userName,
      email,
      password: hash({ plainText: password }),
      age,
      gender,
      phone: encrypt(phone),
    },
  });
  successResponse({ res, status: 201, data: user });
};

export const signIn = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await db_service.findOne({
    model: userModel,
    filter: { email, provider: ProviderEnum.system },
  });
  if (!user) {
    throw new Error("user not exist", { cause: 404 });
  }

  if (!compare({ plainText: password, cipherText: user.password })) {
    throw new Error("invalid password", { cause: 400 });
  }
  const access_token = GenerateToken({
    payload: { id: user._id, email: user.email },
    secret_key: "key",
    options: {
      expiresIn: 60 * 3,
      // notBefore: 60 * 60,
      jwtid: uuidv4(),
    },
  });
  successResponse({ res, data: { access_token } });
};

export const profile = async (req, res, next) => {
  successResponse({ res, data: req.user });
};
