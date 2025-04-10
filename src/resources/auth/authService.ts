import { loadEnvVariables } from "../../configs/env";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { usersTable } from "../../db/schema/users";
import { AuthTokens, LoginInput, RegisterUserInput } from "./authModule";
import bcrypt from "bcrypt";
import crypto from "crypto";
import nodemailer from "nodemailer";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../utils/jwtUtils";

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
  ): Promise<{ user: any; tokens: AuthTokens }> {
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

    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(
      password,
      user.password as string
    );

    if (!isPasswordValid) {
      throw new Error("Invalid email or password!");
    }

    // Check if email is verified
    if (!user.isEmailVerified) {
      throw new Error("Please verify your email before logging in!");
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.role);
    const tokens: AuthTokens = { accessToken, refreshToken };

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
   * Refresh token for new access token
   */
  refreshToken(refreshToken: string) {
    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      throw new Error("Inavalid refreshToken!");
    }
    const newAccessToken = generateAccessToken(decoded.userId, decoded.role);
    return { accessToken: newAccessToken };
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
   * generate access token token
   */
  // async generateToken(userId: string): Promise<AuthTokens> {
  //   // find user role
  //   const userRole = await db
  //     .select()
  //     .from(usersTable)
  //     .where(eq(usersTable.id, userId));
  //   // generate access token
  //   const accessToken = jwt.sign(
  //     { userId, role: userRole[0].role },
  //     process.env.JWT_SECRET!,
  //     {
  //       expiresIn: process.env.JWT_ACCESS_EXPIRES_IN! as any,
  //     }
  //   );

  //   return { accessToken };
  // }

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
  async logout(userId: string): Promise<void> {}

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
