import { loadEnvVariables } from "../../configs/env";
import { NextFunction, Request, Response } from "express";
import { LoginInput, RegisterUserInput } from "./authModule";
import { authService } from "./authService";
import { AuthRequest } from "../../middlewares/authMiddleware";

loadEnvVariables();

export class AuthController {
  /**
   * Register a new user
   */
  async register(req: Request, res: Response) {
    try {
      const userData: RegisterUserInput = req.body;

      // Validate required fields
      if (!userData.email || !userData.password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      const { userId, verificationToken } = await authService.registerUser(
        userData
      );

      // For now, just return the verification token in development
      if (process.env.NODE_ENV === "development") {
        res.status(201).json({
          message: "User registered successfully. Please verify your email.",
          userId,
          verificationToken, // Only in development
        });
      } else {
        res.status(201).json({
          message: "User registered successfully. Please verify your email.",
          userId,
        });
      }
    } catch (error: any) {
      console.error("Register failed!", error);
      res.status(500).json({ message: "Register failed!" });
    }
  }

  /**
   * Verify user email
   */
  async verifyEmail(req: Request, res: Response) {
    try {
      const { token } = req.params;

      const verified = await authService.verifyEmail(token);

      if (!verified) {
        return res
          .status(400)
          .json({ message: "Invalid or expired verification token" });
      }

      res.json({ message: "Email verified successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Login user with email and password
   */
  async login(req: Request, res: Response) {
    try {
      const loginData: LoginInput = req.body;

      // Validate required fields
      if (!loginData.email || !loginData.password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      const result = await authService.login(loginData);

      // @ts-ignore
      const { user, tokens } = result;

      // Set HTTP-only, secure acess token cookie
      res.cookie("accessToken", tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api/auth/refresh-token",
      });

      // Send user in the response body
      res.json({
        message: "Login successful",
      });
    } catch (error: any) {
      console.error(error.message);
      if (
        error.message === "Invalid email or password!" ||
        error.message === "Please verify your email before logging in!"
      ) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Internal Server Error!" });
      }
    }
  }

  /**
   * Refresh token for new access token
   */
  async refreshToken(req: Request, res: Response, next: NextFunction) {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
      return res.status(401).json({ message: "Unauthorized!" });

    try {
      const { accessToken } = authService.refreshToken(refreshToken);
      // Set HTTP-only, secure acess token cookie
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      });

      return res.status(200).json({ message: "Refreshed accessToken!" });
    } catch (error: any) {
      console.error(error);
      if (error.message === "Inavalid refreshToken!")
        return res.status(401).json({ message: error.message });
      else return res.status(500).json({ message: "Internal Server Error" });
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(req: Request, res: Response) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      const resetToken = await authService.requestPasswordReset(email);

      // Don't reveal if the user exists or not for security
      // Send reset email in a real application
      // For development, return the token
      if (process.env.NODE_ENV === "development" && resetToken) {
        res.json({
          message: "Password reset instructions sent to your email",
          resetToken, // Only in development
        });
      } else {
        res.json({
          message: "you will receive password reset instructions",
        });
      }
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(req: Request, res: Response) {
    try {
      const { token, newPassword } = req.body;

      if (!token || !newPassword) {
        return res
          .status(400)
          .json({ message: "Token and new password are required" });
      }

      const reset = await authService.resetPassword(token, newPassword);

      if (!reset) {
        return res
          .status(400)
          .json({ message: "Invalid or expired reset token" });
      }

      res.json({
        message:
          "Password reset successful. You can now log in with your new password.",
      });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Logout user
   */
  async logout(req: Request, res: Response) {
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/api/auth/refresh-token" });
    res.status(200).json({ message: "Logged out successfully" });
  }

  /**
   * Get current user
   */
  getCurrentUser(req: AuthRequest, res: Response) {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Don't send password to client
    const {
      password: _,
      isEmailVerified,
      resetPasswordToken,
      verificationToken,
      resetPasswordExpires,
      createdAt,
      updatedAt,
      ...userWithoutPassword
    } = req.user;

    res.json({ user: userWithoutPassword });
  }
}

export const authController = new AuthController();
