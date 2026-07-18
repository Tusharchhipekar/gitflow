import { Router } from "express";
import {
  logoutController,
  meController,
  refreshController,
  signinController,
  signupController,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.moddleware";

const AuthRouter = Router();

AuthRouter.post("/signup", signupController);
AuthRouter.post("/signin", signinController);
AuthRouter.post("/refresh", refreshController);
AuthRouter.post("/logout", logoutController);
AuthRouter.get("/me", authMiddleware, meController);
export default AuthRouter;
