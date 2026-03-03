import { ProviderEnum } from "../../common/enum/user.enum.js";
import { successResponse } from "../../common/utils/response.success.js";
import {
  decrypt,
  encrypt,
} from "../../common/utils/security/encrypt.security.js";
import {
  GenerateToken,
  verifyToken,
} from "../../common/utils/token.service.js";
import * as db_service from "../../DB/db.service.js";
import userModel from "../../DB/models/user.model.js";
import { hash, compare } from "../../common/utils/security/hash.security.js";
import { v4 as uuidv4 } from "uuid";
import { OAuth2Client } from "google-auth-library";
import { SALT_ROUNDS, SECRET_KEY } from "../../../config/config.service.js";
import joi from "joi";

export const signUp = async (req, res, next) => {
  const { userName, email, password, cPassword, age, gender, phone } = req.body;

  // if (password !== cPassword) {
  //   throw new Error("invalid password", { cause: 400 });
  // }

  // if (await db_service.findOne({ model: userModel, filter: { email } })) {
  //   throw new Error("email already exist", { cause: 409 });
  // }
  // const user = await db_service.create({
  //   model: userModel,
  //   data: {
  //     userName,
  //     email,
  //     password: hash({ plainText: password, salt_rounds: SALT_ROUNDS }),
  //     age,
  //     gender,
  //     phone: encrypt(phone),
  //   },
  // });
  // successResponse({ res, status: 201, data: user });
};

export const signUpWithGmail = async (req, res, next) => {
  const { idToken } = req.body;

  const client = new OAuth2Client();

  const ticket = await client.verifyIdToken({
    idToken,
    audience:
      "1076785632859-kuomrnq42lpcvppdo4lobcse21j4brk0.apps.googleusercontent.com",
  });
  const payload = ticket.getPayload();

  const { email, email_verified, name, picture } = payload;

  let user = await db_service.findOne({ model: userModel, filter: { email } });

  if (!user) {
    user = await db_service.create({
      model: userModel,
      data: {
        email,
        confirmed: email_verified,
        userName: name,
        profilePicture: picture,
        provider: ProviderEnum.google,
      },
    });
  }

  if (user.provider == ProviderEnum.system) {
    throw new Error("please login on system only", { cause: 400 });
  }

  const access_token = GenerateToken({
    payload: { id: user._id, email: user.email },
    secret_key: SECRET_KEY,
    options: {
      expiresIn: "1day",
      // notBefore: 60 * 60,
      jwtid: uuidv4(),
    },
  });
  successResponse({ res, message: "success login", data: { access_token } });
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
    secret_key: SECRET_KEY,
    options: {
      expiresIn: "1day",
      // notBefore: 60 * 60,
      jwtid: uuidv4(),
    },
  });
  successResponse({ res, message: "success login", data: { access_token } });
};

export const profile = async (req, res, next) => {
  successResponse({ res, data: req.user });
};
