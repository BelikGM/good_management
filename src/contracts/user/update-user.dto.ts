import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsInt,
  IsMobilePhone,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'Id юзера',
    required: true,
    example: 'bc807845-08a8-423e-9976-4f60df183ae2',
  })
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @ApiProperty({
    description: 'Имя юзера',
    required: false,
    example: 'Максик',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Имя юзера не может быть пустым!' })
  firstName?: string;

  @ApiProperty({
    description: 'Фамилия юзера',
    required: false,
    example: 'Ковальский',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Фамилия юзера не может быть пустой!' })
  lastName?: string;

  @ApiProperty({
    description: 'Отчество юзера',
    required: false,
    example: 'Тимофеич',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Отчество юзера не может быть пустым!' })
  middleName?: string;

  @IsOptional()
  @IsInt()
  telegramId?: number;

  @ApiProperty({
    description: 'Аватарка юзера',
    required: false,
    example:
      'app\\uploads\\photo_17-03-2025_09-35-58_dac4ebc6-90c3-491d-8c2f-6c936cb34a28.jpg',
  })
  @IsOptional()
  @IsString()
  avatar_url?: string | null;

  @ApiProperty({
    description: 'Телефон юзера',
    required: false,
    example: '+79787878788',
  })
  @IsOptional()
  @IsMobilePhone('ru-RU', { strictMode: true })
  @IsNotEmpty({ message: 'Телефон юзера не может быть пустым!' })
  telephoneNumber?: string;

  @ApiProperty({
    description: 'Флаг увольнения',
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isFired?: boolean;
}
