import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  IsMobilePhone,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Account } from 'src/domains/account.entity';
import { Organization } from 'src/domains/organization.entity';

export class CreateUserDto {
  @ApiProperty({
    description: 'ID юзера',
    required: false,
    example: '675a797e-d0f2-4907-bad5-25733c3e2380',
  })
  @IsOptional()
  @IsUUID()
  id?: string;

  @ApiProperty({ description: 'Имя юзера', required: true, example: 'Максик' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    description: 'Фамилия юзера',
    required: true,
    example: 'Ковальский',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    description: 'Отчество юзера',
    required: true,
    example: 'Тимофеевич',
  })
  @IsString()
  @IsNotEmpty()
  middleName: string;

  @ApiProperty({
    description: 'Номер телефона',
    required: true,
    example: '+79787878778',
  })
  @IsMobilePhone('ru-RU', { strictMode: true })
  @IsNotEmpty({ message: 'Телефон юзера не может быть пустым!' })
  telephoneNumber: string;

  @ApiProperty({
    description: 'Аватарка юзера',
    required: false,
    example:
      'app\\uploads\\photo_17-03-2025_09-35-58_dac4ebc6-90c3-491d-8c2f-6c936cb34a28.jpg',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Аватарка юзера не может быть пустой!' })
  avatar_url?: string;

  @ApiProperty({
    description: 'ID поста',
    required: false,
    example: '675a797e-d0f2-4907-bad5-25733c3e2380',
  })
  @IsOptional()
  @IsUUID()
  postId?: string;

  @ApiProperty({
    description: 'ID организации',
    required: false,
    example: '2d1cea4c-7cea-4811-8cd5-078da7f20167',
  })
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @Exclude({ toPlainOnly: true })
  organization?: Organization;

  @Exclude({ toPlainOnly: true })
  account: Account;
}

// add middlename
