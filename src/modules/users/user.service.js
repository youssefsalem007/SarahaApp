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
import cloudinary from "../../common/utils/cloudinary.js";
import { model } from "mongoose";

export const signUp = async (req, res, next) => {
  const { userName, email, password, cPassword, age, gender, phone } = req.body;

  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {
      folder: "saraha_app/users",
    },
  );

  if (password !== cPassword) {
    throw new Error("invalid password", { cause: 400 });
  }
  // let arr_paths = []
  // for (const file of req.files.attachments) {
  //   arr_paths.push(file.path)

  // }

  if (await db_service.findOne({ model: userModel, filter: { email } })) {
    throw new Error("email already exist", { cause: 409 });
  }
  const user = await db_service.create({
    model: userModel,
    data: {
      userName,
      email,
      password: hash({ plainText: password, salt_rounds: SALT_ROUNDS }),
      age,
      gender,
      phone: encrypt(phone),
      profilePicture: { secure_url, public_id },
      // coverPicture: arr_paths
    },
  });
  successResponse({ res, status: 201, data: user });
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
      expiresIn: 60 * 5,
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

  const refresh_token = GenerateToken({
    payload: { id: user._id, email: user.email },
    secret_key: "key2",
    options: {
      expiresIn: "1y",

      jwtid: uuidv4(),
    },
  });
  successResponse({
    res,
    message: "success login",
    data: { access_token, refresh_token },
  });
};

export const profile = async (req, res, next) => {
  successResponse({ res, data: req.user });
};

export const refresh_token = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    throw new Error("token not exist");
  }

  const [prefix, token] = authorization.split(" ");
  if (prefix !== "bearer") {
    throw new Error("invalid token prefix");
  }

  const decoded = verifyToken({ token: token, secret_key: "key2" });

  if (!decoded || !decoded?.id) {
    throw new Error("invalid token");
  }
  const user = await db_service.findOne({
    model: userModel,
    filter: { _id: decoded.id },
    select: "-password",
  });

  if (!user) {
    throw new Error("user not exist", { cause: 404 });
  }

  const access_token = GenerateToken({
    payload: {
      id: user._id,
      email: user.email,
    },
    secret_key: SECRET_KEY,
    options: {
      expiresIn: 60 * 5,
    },
  });

  successResponse({ res, data: access_token });
};

export const shareProfile = async (req, res, next) => {
  const { id } = req.params;

  const user = await db_service.findById({
    model: userModel,
    id,
    select: "-password",
  });

  if (!user) {
    throw new Error("user not exist");
  }
  user.phone = decrypt(user.phone);
  successResponse({ res, data: user });
};

export const updateProfile = async (req, res, next) => {
  const { firstName, lastName, gender, phone } = req.body;

  if (phone) {
    phone = encrypt(phone);
  }
  const user = await db_service.findOneAndUpdate({
    model: userModel,
    filter: { _id: req.user._id },
    update: { firstName, lastName, gender, phone },
  });

  if (!user) {
    throw new Error("user not exist");
  }

  successResponse({ res, data: user });
};

export const updatePassword = async (req, res, next) => {
  let { oldPassword, newPassword } = req.body;

  if (!compare({ plainText: oldPassword, cipherText: req.user.password })) {
    throw new Error("invalid old password");
  }
  const newHashedPassword = hash({ plainText: newPassword });
  req.user.password = newHashedPassword;
  await req.user.save();

  successResponse({ res });
};
