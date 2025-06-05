interface user {
  id: string;
  email: string;
  username?: string;
  avatar?: string;
  name?: string;
  about?: string;
  location?: any; // JSON or string
  website?: string;
  phone?: string;
  socialLinks?: { platform: string; url: string }[];
  isVerified: boolean;
  accountStatus: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}
