import jwt from "jsonwebtoken";
import { config } from "../config/config";

export const generateAccessToken = (userId: string) => {
  return jwt.sign({ id: userId, type: "access" }, config.JWT_SECRET, {
    expiresIn: "15m",
  });
};

export const generateRefreshToken = (userId: string) => {
  return jwt.sign({ id: userId, type: "refresh" }, config.JWT_SECRET, {
    expiresIn: "7d",
  });
};
