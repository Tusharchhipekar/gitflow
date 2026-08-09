import { config } from "../config/config";

const isProduction = config.NODE_ENV === "production";

export const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ("none" as const) : ("lax" as const),
  maxAge: 24 * 60 * 60 * 1000,
};

export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ("none" as const) : ("strict" as const),
  maxAge: 30 * 24 * 60 * 60 * 1000,
};
