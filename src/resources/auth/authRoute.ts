import { Router } from "express";
import { authController } from "./authController";
import {
  authenticate,
  authorize,
  asyncHandler,
} from "../../middlewares/authMiddleware";

const router = Router();

// Public routes
// auth routes
router.post("/register", asyncHandler(authController.register));
router.get("/verify-email/:token", asyncHandler(authController.verifyEmail));
router.post("/login", asyncHandler(authController.login));
router.post("/refresh-token", asyncHandler(authController.refreshToken));
router.post(
  "/forgot-password",
  asyncHandler(authController.requestPasswordReset)
);
router.post("/reset-password", asyncHandler(authController.resetPassword));

// Google OAuth routes
// router.get("/google", authController.googleAuth);
// router.get("/google/callback", authController.googleCallback);

// Protected routes (require authentication)
router.post("/logout", authenticate, asyncHandler(authController.logout));
// router.get("/me", authenticate, () => authController.getCurrentUser());

// Admin-only routes
// router.post("/admin", authenticate, authorize(["admin"]), (req, res) =>
//   authController.createAdmin(req, res)
// );

export default router;
