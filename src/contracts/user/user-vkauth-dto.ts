import { IsUUID } from 'class-validator';

export class UserVkAuthDto {
  @IsUUID()
  id: string;
  firstName: string;
  lastName: string;
  telephoneNumber: string | null;
  vk_id: number | null;
  avatar_url: string | null;
  token: string;
}
