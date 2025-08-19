import { IsNumber } from 'class-validator';

export class UpdateTgAuthUserDto {
  @IsNumber()
  telegramId: number;
}
