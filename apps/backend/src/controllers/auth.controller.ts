import type { Request, Response } from "express";

export const signinController = (req: Request, res: Response) => {
  console.log("Signin controller");
};

export const signupController = (req: Request, res: Response) => {
  console.log("Signup controller");
};
