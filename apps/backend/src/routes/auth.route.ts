import { Router } from "express";
import {
  logoutController,
  refreshController,
  signinController,
  signupController,
} from "../controllers/auth.controller";

const AuthRouter = Router();

AuthRouter.post("/signup", signupController);
AuthRouter.post("/signin", signinController);
AuthRouter.post("/refresh", refreshController);
AuthRouter.post("/logout", logoutController);
export default AuthRouter;
