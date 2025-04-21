import { Router } from "express";
import {
  emailVerifyHandler,
  forgotPasswordHandler,
  loginHandler,
  logoutHandler,
  refreshTokenHandler,
  registerAccountHandler,
  resetPasswordHandler,
} from "../controllers/auth.controller";
import authenticate from "../middlewares/authenticate";

const authRouter = Router();

authRouter.post("/register", registerAccountHandler);
authRouter.post("/login", loginHandler);
authRouter.get("/email/verify", emailVerifyHandler);
authRouter.post("/password/forgot", forgotPasswordHandler);
authRouter.post("/password/reset", resetPasswordHandler);
authRouter.post("/token/refresh", refreshTokenHandler);
authRouter.post("/logout", authenticate, logoutHandler);

export default authRouter;
