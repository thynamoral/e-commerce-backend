type User = {
  user_id: string;
  email: string;
  password: string;
  isVerified: boolean;
  role: string;
  createdAt: Date;
  updatedAt: Date;
};

export default User;
