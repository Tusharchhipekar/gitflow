import { Router } from "express";
import {
  createRepoController,
  deleteRepoController,
  getRepoController,
  listReposController,
} from "../controllers/repo.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export const repoRouter = Router();

repoRouter.post("/create", authMiddleware, createRepoController);
repoRouter.get("/list", authMiddleware, listReposController);
repoRouter.get("/:id", authMiddleware, getRepoController);
repoRouter.delete("/:id", authMiddleware, deleteRepoController);
