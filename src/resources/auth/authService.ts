import { loadEnvVariables } from "../../configs/env";
import { eq } from "drizzle-orm";
import { db } from "../../db";
import { usersTable } from "../../db/schema/users";
import { AuthTokens, LoginInput, RegisterUserInput } from "./authModule";
import bcrypt from "bcrypt";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import { refreshTokenTable } from "../../db/schema/refreshTokens";

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

    return { userId: createdUser.id, verificationToken };
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

    // store refresh token
    await db.insert(refreshTokenTable).values({
      userId,
      token: refreshToken,
      expiresAt: refreshExpires,
    });

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
