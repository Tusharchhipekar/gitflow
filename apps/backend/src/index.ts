import cookieParser from "cookie-parser";
import express from "express";
import morgan from "morgan";

import { config } from "./config/config";
import AuthRouter from "./routes/auth.route";

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (_req, res) => {
  res.status(200).json({ message: "Health check ok" });
});

app.use("/api/v1/auth", AuthRouter);

console.log("PORT VALUE:", JSON.stringify(config.PORT), typeof config.PORT);

const server = app.listen(config.PORT, () => {
  console.log(`Server is running on port http://localhost:${config.PORT}`);
});

server.on("error", (err) => {
  console.error("LISTEN ERROR:", err);
});
