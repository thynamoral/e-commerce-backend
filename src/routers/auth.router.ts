import { Router } from "express";
import { registerAccountHandler } from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/register", registerAccountHandler);

export default authRouter;
