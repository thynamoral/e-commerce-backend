type User = {
  user_id: string;
  email: string;
  password: string;
  isverified: boolean;
  role: string;
  createdat: Date;
  updatedat: Date;
};

export default User;
