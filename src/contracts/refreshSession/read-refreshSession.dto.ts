import { User } from 'src/domains/user.entity';

export class ReadRefreshSessionDto {
  id: string;
  user_agent: string;
  fingerprint: string;
  ip: string;
  expiresIn: number;
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
}
