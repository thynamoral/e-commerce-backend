import { Router } from "express";
import { getCurrentUserHandler } from "../controllers/user.controller";
import authenticate from "../middlewares/authenticate";

const userRouter = Router();

userRouter.get("/", authenticate, getCurrentUserHandler);

export default userRouter;
