declare global {
  namespace Express {
    interface Request {
      user_id: string | undefined;
      session_id: string | undefined;
      role: string | undefined;
    }
  }
}

export {};
