import { Router } from "express";
import {
  getMessagesController,
  postMessageController,
} from "../controllers/message.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export const messageRouter = Router();

messageRouter.get("/:id/messages", authMiddleware, getMessagesController);
messageRouter.post("/:id/messages", authMiddleware, postMessageController);
