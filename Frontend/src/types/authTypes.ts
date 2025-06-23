export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'google' | 'github' | 'local';
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}