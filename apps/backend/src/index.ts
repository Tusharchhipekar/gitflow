import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";
import passport from "passport";
import {
  Strategy as GoogleStrategy,
  type Profile,
  type VerifyCallback,
} from "passport-google-oauth20";
import { config } from "./config/config";
import AuthRouter from "./routes/auth.route";
import { repoRouter } from "./routes/repo.route";
import { sectionRouter } from "./routes/section.route";
import { pageRouter } from "./routes/page.route";

export const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(passport.initialize());

if (!config.GOOGLE_CLIENT_ID || !config.GOOGLE_CLIENT_SECRET) {
  throw new Error(
    "Missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET in environment",
  );
}

passport.use(
  new GoogleStrategy(
    {
      clientID: config.GOOGLE_CLIENT_ID,
      clientSecret: config.GOOGLE_CLIENT_SECRET,
      callbackURL: `http://localhost:${config.PORT}/api/v1/auth/google/callback`,
    },
    async (
      _accessToken: string,
      _refreshToken: string,
      profile: Profile,
      done: VerifyCallback,
    ) => {
      console.log("Google Profile:", profile);
      done(null, profile);
    },
  ),
);

app.get("/", (_req, res) => {
  res.status(200).json({ message: "Health check ok" });
});

app.use("/api/v1/auth", AuthRouter);
app.use("/api/v1/repo", repoRouter);
app.use("/api/v1/repo", sectionRouter);
app.use("/api/v1/page", pageRouter);

app.listen(config.PORT, () => {
  console.log(`Server is running on port http://localhost:${config.PORT}`);
});
