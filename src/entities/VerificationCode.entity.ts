export type VerificationCode = {
  verification_code_id: string;
  user_id: string;
  type: string;
  createdat: Date;
  expiredat: Date;
};
