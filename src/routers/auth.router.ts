import { Router } from "express";
import {
  emailVerifyHandler,
  loginHandler,
  logoutHandler,
  registerAccountHandler,
} from "../controllers/auth.controller";

const authRouter = Router();

authRouter.post("/register", registerAccountHandler);
authRouter.post("/login", loginHandler);
authRouter.get("/email/verify", emailVerifyHandler);
authRouter.post("/logout", logoutHandler);

export default authRouter;
