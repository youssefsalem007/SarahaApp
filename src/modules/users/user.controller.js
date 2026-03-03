import { Router } from "express";
import * as US from "../users/user.service.js";
import * as UV from "./user.validation.js";
import { authentication } from "../../common/middleware/authentication.js";
import { authorization } from "../../common/middleware/authorization.js";
import { RoleEnum } from "../../common/enum/user.enum.js";
import { validation } from "../../common/middleware/validation.js";
import { multer_local } from "../../common/middleware/multer.js";
import { multer_enum } from "../../common/enum/multer.enum.js";




const userRouter = Router();


 
userRouter.post("/signup",multer_local({custom_types: [...multer_enum.image, ...multer_enum.pdf]}).single("attachment"), US.signUp);
userRouter.post("/signup/gmail", US.signUpWithGmail);
userRouter.post("/signin", US.signIn);
userRouter.get("/profile", authentication, US.profile);

export default userRouter;
