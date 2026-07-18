import { config } from "../config/config";
import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AccessTokenPayload {
  id: string;
  type: string;
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ message: "No access token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "No access token provided" });
      return;
    }

    let payload: AccessTokenPayload;
    try {
      payload = jwt.verify(token, config.JWT_SECRET) as AccessTokenPayload;
    } catch {
      res.status(401).json({ message: "Invalid or expired access token" });
      return;
    }

    if (payload.type !== "access") {
      res.status(401).json({ message: "Invalid token type" });
      return;
    }

    req.userId = payload.id;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res
      .status(500)
      .json({ message: "Something went wrong. Please try again later." });
  }
};
