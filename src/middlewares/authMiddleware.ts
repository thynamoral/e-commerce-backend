import { Request, Response, NextFunction } from "express";
import passport from "passport";

export interface AuthRequest extends Request {
  user?: any;
}

/**
 * Authentication middleware using JWT
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  passport.authenticate(
    "jwt",
    { session: false },
    (err: any, user: any, info: any) => {
      if (err) {
        return next(err);
      }

      if (!user) {
        return res
          .status(401)
          .json({ message: "Unauthorized: Authentication required" });
      }

      // Add user to request object
      (req as AuthRequest).user = user;
      return next();
    }
  )(req, res, next);
};

/**
 * Check if user has specific role
 */
export const authorize = (roles: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authReq = req as AuthRequest;

    if (!authReq.user) {
      return res
        .status(401)
        .json({ message: "Unauthorized: Authentication required" });
    }

    // If roles are not specified, allow all authenticated users
    if (roles.length === 0) {
      return next();
    }

    // Check if user has required role
    if (!roles.includes(authReq.user.role)) {
      return res
        .status(403)
        .json({ message: "Forbidden: Insufficient permissions" });
    }

    next();
  };
};

/**
 * Middleware to require admin role
 */
export const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authReq = req as AuthRequest;

  if (!authReq.user) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Authentication required" });
  }

  if (authReq.user.role !== "admin") {
    return res
      .status(403)
      .json({ message: "Forbidden: Admin privileges required" });
  }

  next();
};

/**
 * Error handling middleware for authentication errors
 */
export const authErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ message: "Invalid token" });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ message: "Token expired" });
  }

  next(err);
};

/**
 * Async handler middleware wrapper
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
