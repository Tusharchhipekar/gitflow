import { Router } from "express";
import { getPageController } from "../controllers/page.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export const pageRouter = Router();

pageRouter.get("/:id", authMiddleware, getPageController);
