import { Router } from "express";
import {
  signinController,
  signupController,
} from "../controllers/auth.controller";

const AuthRouter = Router();

AuthRouter.post("/signup", signupController);
AuthRouter.post("/signin", signinController);

export default AuthRouter;
