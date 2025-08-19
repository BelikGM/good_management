import { IsUUID } from 'class-validator';

export class UserTgAuthDto {
  @IsUUID()
  id: string;
  token: string;
}
