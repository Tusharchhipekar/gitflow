import type { Request, Response } from "express";
import prisma from "@repo/db-prisma";
import { SigninInputSchema, SignupInputSchema } from "@repo/types";
import { generateAccessToken, generateRefreshToken } from "../utils/token";
import { config } from "../config/config";
import jwt from "jsonwebtoken";

export const signupController = async (req: Request, res: Response) => {
  try {
    const result = SignupInputSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({ message: "Invalid input" });
      return;
    }

    const { name, email, provider } = result.data;

    const userExist = await prisma.user.findUnique({
      where: { email },
    });

    if (userExist) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    let newUser;

    if (provider === "google") {
      const { googleId } = result.data;

      newUser = await prisma.user.create({
        data: { name, email, googleId, password: null },
      });
    } else {
      const { password } = result.data;

      const hashedPassword = await Bun.password.hash(password, {
        algorithm: "bcrypt",
      });

      newUser = await prisma.user.create({
        data: { name, email, password: hashedPassword },
      });
    }

    const accessToken = generateAccessToken(newUser.id.toString());
    const refreshToken = generateRefreshToken(newUser.id.toString());

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "user created successfully",
      success: true,
      accessToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again later." });
  }
};

export const signinController = async (req: Request, res: Response) => {
  try {
    const result = SigninInputSchema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({ message: "Invalid input" });
      return;
    }

    const { email, password } = result.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    if (!user.password) {
      res.status(400).json({
        message:
          "This account uses Google sign-in. Please continue with Google.",
      });
      return;
    }

    const isValid = await Bun.password.verify(
      password,
      user.password,
      "bcrypt",
    );

    if (!isValid) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const accessToken = generateAccessToken(user.id.toString());
    const refreshToken = generateRefreshToken(user.id.toString());

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: "signed in successfully",
      success: true,
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Signin error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again later." });
  }
};

export const refreshController = async (req: Request, res: Response) => {
  try {
    const token = req.cookies?.refreshToken;

    if (!token) {
      res.status(401).json({ message: "No refresh token provided" });
      return;
    }

    let payload: { id: string; type: string };
    try {
      payload = jwt.verify(token, config.JWT_REFRESH_SECRET) as {
        id: string;
        type: string;
      };
    } catch {
      res.status(401).json({ message: "Invalid or expired refresh token" });
      return;
    }

    if (payload.type !== "refresh") {
      res.status(401).json({ message: "Invalid token type" });
      return;
    }

    const newAccessToken = generateAccessToken(payload.id);

    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Refresh error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again later." });
  }
};

export const logoutController = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    res.status(200).json({ message: "logged out successfully", success: true });
  } catch (error) {
    console.error("Logout error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again later." });
  }
};

export const meController = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ message: "Not authenticated" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Me controller error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again later." });
  }
};
