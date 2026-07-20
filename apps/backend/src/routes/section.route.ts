import { Router } from "express";
import { getRepoSectionsController } from "../controllers/section.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export const sectionRouter = Router();

sectionRouter.get("/:id/sections", authMiddleware, getRepoSectionsController);
