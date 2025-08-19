import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Policy } from 'src/domains/policy.entity';
import { Role } from 'src/domains/role.entity';
import { User } from 'src/domains/user.entity';

export class PostUpdateDto {
  @ApiProperty({
    description: 'Id поста',
    required: true,
    example: '2420fabb-3e37-445f-87e6-652bfd5a050c',
  })
  @IsNotEmpty({ message: 'ID обновляемого поста не может быть пустым!' })
  @IsUUID()
  _id: string;

  @ApiProperty({
    description: 'Название поста',
    required: false,
    example: 'Директор',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Название поста не может быть пустым!' })
  postName?: string;

  @ApiProperty({
    description: 'Название отдела',
    required: false,
    example: 'Отдел продаж',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Название отдела не может быть пустым!' })
  divisionName?: string;

  @ApiProperty({
    description: 'Родительский пост',
    required: false,
    example: '87af2eb9-a17d-4e78-b847-9d512cb9a0c9',
  })
  @IsOptional()
  @IsUUID()
  parentId?: string | null;

  @ApiProperty({
    description: 'Продукт поста',
    required: false,
    example: 'Продукт',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Продукт не может быть пустым!' })
  product?: string;

  @ApiProperty({
    description: 'Назначение поста',
    required: false,
    example: 'Предназначение поста',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Предназначение поста не может быть пустым!' })
  purpose?: string;

  @ApiProperty({
    description: 'ID ответственного, с которым связать пост',
    required: false,
    example: '3b809c42-2824-46c1-9686-dd666403402a',
  })
  @IsOptional()
  @IsUUID()
  responsibleUserId?: string | null;

  @ApiProperty({
    description: 'ID политики, с которой связать пост',
    required: false,
    example: '865a8a3f-8197-41ee-b4cf-ba432d7fd51f',
  })
  @IsOptional()
  @IsUUID()
  policyId?: string | null;

  @ApiProperty({
    description: 'ID роли',
    required: false,
    example: '675a797e-d0f2-4907-bad5-25733c3e2380',
  })
  @IsOptional()
  @IsUUID()
  @IsNotEmpty()
  roleId?: string;

  @ApiProperty({
    description: 'Флаг дефолтного поста',
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiProperty({
    description: 'Флаг архивного поста',
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isArchive?: boolean;

  @Exclude({ toPlainOnly: true })
  user: User;

  @Exclude({ toPlainOnly: true })
  policy: Policy;

  @Exclude({ toPlainOnly: true })
  role: Role;
}

