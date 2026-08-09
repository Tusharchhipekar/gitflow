import { config } from "../config/config";

const isProduction = config.NODE_ENV === "production";

// Frontend and backend both live under the itiswhatitistush.in root domain
// (gitflow.itiswhatitistush.in / api.itiswhatitistush.in), so these are
// same-site cookies even in production — no SameSite=None workaround needed.
export const ACCESS_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "lax" as const,
  maxAge: 24 * 60 * 60 * 1000,
};

export const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "strict" as const,
  maxAge: 30 * 24 * 60 * 60 * 1000,
};
