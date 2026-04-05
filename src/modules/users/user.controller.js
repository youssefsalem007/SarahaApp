import { Router } from "express";
import * as US from "../users/user.service.js";
import * as UV from "./user.validation.js";
import { authentication } from "../../common/middleware/authentication.js";
import { authorization } from "../../common/middleware/authorization.js";
import { RoleEnum } from "../../common/enum/user.enum.js";
import { validation } from "../../common/middleware/validation.js";
import { multer_host, multer_local } from "../../common/middleware/multer.js";
import { multer_enum } from "../../common/enum/multer.enum.js";




const userRouter = Router();


 
userRouter.post("/signup",multer_host(multer_enum.image).single("attachment"),validation(UV.signUpSchema) , US.signUp);
userRouter.post("/signup/gmail", US.signUpWithGmail);
userRouter.post("/signin",validation(UV.signInSchema) , US.signIn);
userRouter.get("/profile", authentication, US.profile);
userRouter.get("/share-profile/:id",validation(UV.shareProfileSchema), US.shareProfile);
userRouter.patch("/update-profile",authentication,validation(UV.updateProfileSchema), US.updateProfile);
userRouter.patch("/update-password",authentication,validation(UV.updatePasswordSchema), US.updatePassword);
userRouter.get("/refresh-token", US.refresh_token);
userRouter.post("/logout",authentication, US.logout);


export default userRouter; 
