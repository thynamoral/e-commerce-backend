import { Router } from "express";
import {
  loginHandler,
  logoutHandler,
  registerAccountHandler,
} from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/register", registerAccountHandler);
authRouter.post("/login", loginHandler);
authRouter.post("/logout", logoutHandler);

export default authRouter;
