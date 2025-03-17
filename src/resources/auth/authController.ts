import { loadEnvVariables } from "../../configs/env";
import { Request, Response } from "express";
import passport from "passport";
import { LoginInput, RegisterUserInput } from "./authModule";
import { authService } from "./authService";
import { AuthRequest } from "../../middlewares/authMiddleware";
import nodemailer from "nodemailer";

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

      // Send verification email in a real application
      const verificationLink = `${process.env
        .FRONTEND_URL!}/verify-email/${verificationToken}`;
      const transporter = nodemailer.createTransport({
        service: "gmail",
        port: process.env.NODE === "development" ? 587 : 465,
        secure: !(process.env.NODE === "development"),
        auth: {
          user: process.env.MAIL_FROM!,
          pass: process.env.MAIL_PASSWORD!,
        },
      });

      await transporter.sendMail({
        from: process.env.MAIL_FROM!,
        to: userData.email,
        subject: "Verify your email",
        text: `Click the link to verify: ${verificationLink}`,
        html: `<p>Click the link to verify: <a href="${verificationLink}">here</a> to verify your account!</p>`,
      });

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

      // add user to req body
      // req.user = user;

      // Set HTTP-only, secure refresh token cookie
      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/auth/refresh-token",
      });

      // Send accessToken in the response body
      res.json({
        message: "Login successful",
        user,
        accessToken: tokens.accessToken,
      });
    } catch (error: any) {
      console.error(error.message);
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Login or signup with Google
   */
  googleAuth(req: Request, res: Response) {
    passport.authenticate("google", { scope: ["profile", "email"] })(req, res);
  }

  /**
   * Google OAuth callback
   */
  async googleCallback(req: Request, res: Response) {
    passport.authenticate("google", { session: false }, async (err, user) => {
      if (err) {
        return res.status(500).json({ message: "Authentication failed" });
      }

      if (!user) {
        return res.status(401).json({ message: "Authentication failed" });
      }

      try {
        // Generate tokens
        const tokens = await authService.generateToken(user.id);

        // Redirect to frontend with tokens
        const redirectUrl = new URL(
          process.env.FRONTEND_URL + "/auth/callback"
        );
        redirectUrl.searchParams.append("accessToken", tokens.accessToken);
        redirectUrl.searchParams.append("refreshToken", tokens.refreshToken);

        res.redirect(redirectUrl.toString());
      } catch (error: any) {
        res.status(500).json({ message: error.message });
      }
    })(req, res);
  }

  /**
   * Refresh access token
   */
  async refreshToken(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({ message: "Unauthorized!" });
      }

      const accessToken = await authService.refreshAccessToken(refreshToken);

      if (!accessToken) {
        return res
          .status(401)
          .json({ message: "Invalid or expired refresh token" });
      }

      res.json({ accessToken });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
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
  async logout(req: AuthRequest, res: Response) {
    console.log(`user`, req?.user);
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      await authService.logout(req.user.id);

      // Clear refresh token cookie
      res.clearCookie("refreshToken", { path: "/auth/refresh-token" });

      res.json({ message: "Logged out successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
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

  /**
   * Create admin user (for development/initial setup)
   */
  async createAdmin(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }

      await authService.createAdminUser(email, password);

      res.json({ message: "Admin user created or updated successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}

export const authController = new AuthController();
