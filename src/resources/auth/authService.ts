import { loadEnvVariables } from "../../configs/env";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { usersTable } from "../../db/schema/users";
import { AuthTokens, LoginInput, RegisterUserInput } from "./authModule";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { refreshTokenTable } from "../../db/schema/refreshTokens";
import nodemailer from "nodemailer";

loadEnvVariables();

export class AuthService {
  /**
   * register a new user with email and password
   */
  async registerUser(
    userInputData: RegisterUserInput
  ): Promise<{ userId: string; verificationToken: string }> {
    const { email, password, firstName, lastName } = userInputData;

    // check if email is existed
    const existedUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));
    if (existedUser.length > 0) {
      // email existed but not verify yet
      if (!existedUser[0].isEmailVerified) {
        const newVerificationToken = crypto.randomBytes(32).toString("hex");
        const [updatedUserToken] = await db
          .update(usersTable)
          .set({
            verificationToken: newVerificationToken,
          })
          .where(eq(usersTable.id, existedUser[0].id))
          .returning();
        await this.sendEmail(updatedUserToken, newVerificationToken);
        return {
          userId: updatedUserToken.id,
          verificationToken: newVerificationToken,
        };
      }

      throw new Error("User with email already existed!");
    }

    // hash password
    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.SALT_ROUND!)
    );

    // generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // create new user
    const [createdUser] = await db
      .insert(usersTable)
      .values({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        verificationToken,
      })
      .returning();

    await this.sendEmail(createdUser, verificationToken);
    return { userId: createdUser.id, verificationToken };
  }

  /**
   * Send email to verify
   */
  async sendEmail(
    userData: typeof usersTable.$inferSelect,
    verificationToken: string
  ) {
    const verificationLink = `${process.env
      .FRONTEND_URL!}/verify-email/${verificationToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false,
      auth: {
        user: process.env.MAIL_FROM!,
        pass: process.env.MAIL_PASSWORD!,
      },
    });

    await transporter.sendMail({
      from: `"Momo E-Commerce" <${process.env.MAIL_FROM!}>`,
      to: userData.email,
      subject: "Verify Your Email - Momo E-Commerce",
      text: `Welcome to Momo E-Commerce! Please verify your email by clicking the link below:\n\n${verificationLink}\n\nIf you did not sign up, please ignore this email.\n\nBest,\nMomo E-Commerce Team`,
      html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
        <h2 style="color: #3171af; text-align: center;">Welcome to Momo E-Commerce!</h2>
        <p>Thank you for signing up! Please confirm your email address by clicking the button below:</p>
        <p style="text-align: center;">
          <a href="${verificationLink}" 
            style="background-color: #3171af; color: white; padding: 12px 20px; border-radius: 8px; text-decoration: none; font-size: 16px; font-weight: bold; display: inline-block;">
            Verify Email
          </a>
        </p>
        <p>If you did not create an account, please ignore this email.</p>
        <p>Best regards,<br/><strong>Momo E-Commerce Team</strong></p>
      </div>
    `,
    });
  }

  /**
   * Login user with email and password
   */
  async login(
    loginData: LoginInput
  ): Promise<{ user: any; tokens: AuthTokens } | null> {
    const { email, password } = loginData;

    // Find user by email
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (users.length === 0) {
      throw new Error("Invalid email or password!");
    }

    const user = users[0];

    // Check if user has password (might be Google OAuth user)
    if (!user.password) {
      throw new Error("Please sign in with Google");
    }

    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new Error("Invalid email or password!");
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      throw new Error("Please verify your email before logging in");
    }

    // Generate tokens
    const tokens = await this.generateToken(user.id);

    // Return user and tokens
    const {
      password: _,
      googleId,
      isEmailVerified,
      resetPasswordToken,
      verificationToken,
      resetPasswordExpires,
      createdAt,
      updatedAt,
      ...userWithoutPassword
    } = user;
    return { user: userWithoutPassword, tokens };
  }

  /**
   * verify user's email with verification token
   */
  async verifyEmail(token: string) {
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.verificationToken, token));
    // not found user
    if (users.length === 0) {
      return false;
    }

    // found user
    await db
      .update(usersTable)
      .set({
        isEmailVerified: true,
        verificationToken: null,
      })
      .where(eq(usersTable.id, users[0].id));

    return true;
  }

  /**
   * generate access token and refresh token
   */
  async generateToken(userId: string): Promise<AuthTokens> {
    // generate access token
    const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN! as any,
    });

    // generate refresh token
    const refreshToken = crypto.randomBytes(32).toString("hex");
    const refreshExpires = new Date();
    refreshExpires.setDate(
      refreshExpires.getDate() + parseInt(process.env.JWT_REFRESH_EXPIRES_IN!)
    );

    // check if refresh token of userId existed
    const existedToken = await db
      .select()
      .from(refreshTokenTable)
      .where(eq(refreshTokenTable.userId, userId));

    if (existedToken.length > 0) {
      await db
        .update(refreshTokenTable)
        .set({
          token: refreshToken,
          expiresAt: refreshExpires,
        })
        .where(eq(refreshTokenTable.userId, userId));
    } else {
      // store refresh token
      await db.insert(refreshTokenTable).values({
        userId,
        token: refreshToken,
        expiresAt: refreshExpires,
      });
    }

    return { accessToken, refreshToken };
  }

  /**
   * refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<string | null> {
    // find refresh token
    const tokens = await db
      .select({
        id: refreshTokenTable.id,
        userId: refreshTokenTable.userId,
        expiresIn: refreshTokenTable.expiresAt,
      })
      .from(refreshTokenTable)
      .where(eq(refreshTokenTable.token, refreshToken));

    if (tokens.length === 0) {
      return null;
    }

    // found refresh token
    const token = tokens[0];

    // check if refresh token is expired
    if (new Date() > token.expiresIn) {
      await db
        .delete(refreshTokenTable)
        .where(eq(refreshTokenTable.id, token.id));
      return null;
    }

    // generate new access token
    return jwt.sign({ userId: token.userId }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN! as any,
    });
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<string | null> {
    // find user
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (users.length === 0) {
      return null;
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date();
    expires.setHours(expires.getHours() + 1);

    // update reset password token
    await db
      .update(usersTable)
      .set({
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      })
      .where(eq(usersTable.id, users[0].id));

    return token;
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.resetPasswordToken, token));

    if (users.length === 0) {
      return false;
    }

    const user = users[0];

    // Check if token is expired
    if (!user.resetPasswordExpires || new Date() > user.resetPasswordExpires) {
      return false;
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(
      newPassword,
      parseInt(process.env.SALT_ROUND!)
    );

    // Update password and clear reset token
    await db
      .update(usersTable)
      .set({
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      })
      .where(eq(usersTable.id, user.id));

    return true;
  }

  /**
   * Logout user by invalidating refresh tokens
   */
  async logout(userId: string): Promise<void> {
    await db
      .delete(refreshTokenTable)
      .where(eq(refreshTokenTable.userId, userId));
  }

  /**
   * Create admin user
   */
  async createAdminUser(email: string, password: string): Promise<void> {
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, email));

    if (existingUser.length > 0) {
      // If user exists, update role to admin
      await db
        .update(usersTable)
        .set({ role: "admin" })
        .where(eq(usersTable.id, existingUser[0].id));
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user
    await db.insert(usersTable).values({
      email,
      password: hashedPassword,
      role: "admin",
      isEmailVerified: true,
    });
  }
}

export const authService = new AuthService();
