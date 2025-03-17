import { loadEnvVariables } from "./env";
import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { db } from "../db";
import { usersTable } from "../db/schema/users";
import { eq } from "drizzle-orm";

loadEnvVariables();

// configure passport strategies
export const configurePassport = () => {
  // Local Strategy for email/password login
  passport.use(
    new LocalStrategy(
      { usernameField: "email" },
      async (email, password, done) => {
        try {
          // find email
          const users = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.email, email));

          // invalid email
          if (users.length === 0) {
            return done(null, false, { message: "Invalid email or password!" });
          }

          // found user
          const user = users[0];

          // user with google account
          if (!user.password) {
            return done(null, false, {
              message: "Please log in with Google account!",
            });
          }

          // verify password
          const isValidPassword = await bcrypt.compare(password, user.password);
          if (!isValidPassword) {
            return done(null, false, { message: "Invalid email or password!" });
          }

          // check if email is verified
          if (!user.isEmailVerified) {
            return done(null, false, {
              message: "Please verify your email before logging in!",
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // JWT Strategy for token authentication
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET! as string,
      },
      async (payload, done) => {
        try {
          // console.log("Verifying JWT Payload:", payload);
          // find user from JWT payload
          const users = await db
            .select()
            .from(usersTable)
            .where(eq(usersTable.id, payload.userId));

          // invalid user
          if (users.length === 0) {
            return done(null, false, {
              message: "Invalid token!",
            });
          }

          // found user
          return done(null, users[0]);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID! && process.env.GOOGLE_CLIENT_SECRET!) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID!,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          callbackURL: `${process.env.API_URL}/auth/google/callback`,
          scope: ["profile", "email"],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            // Check if user exists
            const email = profile.emails?.[0]?.value;

            if (!email) {
              return done(null, false, {
                message: "Invalid Google account!",
              });
            }

            let user = (
              await db
                .select()
                .from(usersTable)
                .where(eq(usersTable.email, email))
            )[0];

            if (!user) {
              // Create new user if doesn't exist
              const firstName = profile.name?.givenName || "";
              const lastName = profile.name?.familyName || "";

              const [newUser] = await db
                .insert(usersTable)
                .values({
                  email,
                  googleId: profile.id,
                  firstName,
                  lastName,
                  isEmailVerified: true, // Email is verified through Google
                })
                .returning();

              user = newUser;
            } else if (!user.googleId) {
              // Link Google ID to existing account
              await db
                .update(usersTable)
                .set({
                  googleId: profile.id,
                  isEmailVerified: true,
                })
                .where(eq(usersTable.id, user.id));
            }

            return done(null, user);
          } catch (error) {
            return done(error, false);
          }
        }
      )
    );
  }
};
