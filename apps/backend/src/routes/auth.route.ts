import { Router } from "express";
import {
  logoutController,
  meController,
  refreshController,
  signinController,
  signupController,
} from "../controllers/auth.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import type { Request, Response } from "express";
import type { GoogleProfile } from "../types/type";
import passport from "passport";
import prisma from "@repo/db-prisma";
import { generateAccessToken, generateRefreshToken } from "../utils/token";
import { config } from "../config/config";
import {
  ACCESS_COOKIE_OPTIONS,
  REFRESH_COOKIE_OPTIONS,
} from "../utils/cookie-options";

const AuthRouter = Router();

AuthRouter.post("/signup", signupController);
AuthRouter.post("/signin", signinController);
AuthRouter.post("/refresh", refreshController);
AuthRouter.post("/logout", logoutController);
AuthRouter.get("/me", authMiddleware, meController);

AuthRouter.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

AuthRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${config.FRONTEND_URL}/login`,
  }),
  async (req: Request, res: Response) => {
    try {
      const { id, displayName, emails } = req.user as GoogleProfile;
      const email = emails?.[0]?.value;

      if (!email) {
        return res.redirect(`${config.FRONTEND_URL}/login?error=no_email`);
      }

      let user = await prisma.user.findUnique({
        where: { googleId: id },
      });

      if (!user) {
        const existingByEmail = await prisma.user.findUnique({
          where: { email },
        });

        if (existingByEmail) {
          user = await prisma.user.update({
            where: { email },
            data: { googleId: id },
          });
        } else {
          user = await prisma.user.create({
            data: {
              googleId: id,
              email,
              name: displayName,
            },
          });
        }
      }

      const accessToken = generateAccessToken(user.id.toString());
      const refreshToken = generateRefreshToken(user.id.toString());

      res.cookie("token", accessToken, ACCESS_COOKIE_OPTIONS);
      res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

      res.redirect(`${config.FRONTEND_URL}/projects`);
    } catch (err) {
      console.error("Error during Google authentication:", err);
      res.redirect(`${config.FRONTEND_URL}/login?error=server_error`);
    }
  },
);

export default AuthRouter;
