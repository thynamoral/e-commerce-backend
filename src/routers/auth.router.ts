import { Router } from "express";
import {
  loginHandler,
  registerAccountHandler,
} from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/register", registerAccountHandler);
authRouter.post("/login", loginHandler);

export default authRouter;
