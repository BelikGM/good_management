import { User } from 'src/domains/user.entity';
import {
  IsOptional,
  IsString,
  IsIP,
  IsNumber,
  IsPositive,
  IsNotEmpty,
} from 'class-validator';
import { Exclude } from 'class-transformer';

export class CreateRefreshSessionDto {
  @IsString()
  @IsNotEmpty()
  user_agent: string;

  @IsString()
  @IsNotEmpty()
  fingerprint: string;

  @IsIP()
  @IsNotEmpty()
  ip: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  expiresIn: number;

  @IsOptional()
  @IsString()
  refreshToken?: string;

  @Exclude({ toPlainOnly: true })
  user: User;
}
