import {
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ReadRefreshSessionDto } from '../refreshSession/read-refreshSession.dto';
import { Post } from 'src/domains/post.entity';
import { Organization } from 'src/domains/organization.entity';
import { Account } from 'src/domains/account.entity';
import { HistoryUsersToPost } from 'src/domains/historyUsersToPost.entity';
import { Type } from 'class-transformer';

export class ReadUserDto {
  @IsUUID()
  id: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  middleName: string;

  @IsOptional()
  @IsNumber()
  telegramId: number;

  @IsString()
  telephoneNumber: string;

  @IsOptional()
  @IsString()
  avatar_url: string;

  @IsOptional()
  @IsNumber()
  vk_id: number;

  @IsOptional()
  isFired: boolean;

  @IsDate()
  @Type(() => Date)
  createdAt: Date;

  @IsDate()
  @Type(() => Date)
  updatedAt: Date;
  posts: Post[];
  refreshSessions: ReadRefreshSessionDto[];
  organization: Organization;
  account: Account;
  historiesUsersToPost: HistoryUsersToPost[];
}
