import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ReadUserDto } from './user/read-user.dto';
import { Type } from 'class-transformer';

export class AuthTG {
  @ApiProperty({ description: 'Телеграм id' })
  @IsNumber()
  @IsNotEmpty()
  telegramId: number;

  @ApiProperty({ description: 'Id сокета клиента' })
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({ description: 'Токен логина' })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ValidateNested()
  @Type(() => ReadUserDto)
  user: ReadUserDto;
}
