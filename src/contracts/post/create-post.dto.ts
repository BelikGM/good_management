import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { Account } from 'src/domains/account.entity';
import { Organization } from 'src/domains/organization.entity';
import { Policy } from 'src/domains/policy.entity';
import { Role } from 'src/domains/role.entity';
import { User } from 'src/domains/user.entity';

export class PostCreateDto {
  @IsOptional()
  @IsUUID()
  @IsNotEmpty()
  id?: string;

  @ApiProperty({
    description: 'Название поста',
    required: true,
    example: 'Директор',
  })
  @IsString()
  @IsNotEmpty({ message: 'Название поста не может быть пустым!' })
  postName: string;

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
    example: 'b2218813-8985-465b-848e-9a78b1627f11',
  })
  @IsOptional()
  @IsUUID()
  @IsNotEmpty()
  parentId?: string;

  @ApiProperty({
    description: 'Продукт поста',
    required: true,
    example: 'Продукт',
  })
  @IsString()
  @IsNotEmpty({ message: 'Продукт поста не может быть пустым!' })
  product: string;

  @ApiProperty({
    description: 'Назначение поста',
    example: 'Предназначение поста',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Предназначение поста не может быть пустым!' })
  purpose: string;

  @ApiProperty({
    description: 'ID роли',
    required: false,
    example: '675a797e-d0f2-4907-bad5-25733c3e2380',
  })
  @IsUUID()
  @IsNotEmpty()
  roleId: string;

  @ApiProperty({
    description: 'ID ответственного, с которым связать пост',
    required: false,
    example: 'bc807845-08a8-423e-9976-4f60df183ae2',
  })
  @IsOptional()
  @IsUUID()
  @IsNotEmpty()
  responsibleUserId?: string;

  @ApiProperty({
    description: 'ID политики',
    required: false,
    example: 'bc807845-08a8-423e-9976-4f60df183ae2',
  })
  @IsOptional()
  @IsUUID()
  @IsNotEmpty()
  policyId?: string;

  @ApiProperty({
    description: 'ID организации, с которой связать пост',
    required: true,
    example: '2d1cea4c-7cea-4811-8cd5-078da7f20167',
  })
  @IsUUID()
  @IsNotEmpty({ message: 'Выберите организацию для поста!' })
  organizationId: string;

  @Exclude({ toPlainOnly: true }) // nullable
  user: User;

  @Exclude({ toPlainOnly: true })
  organization: Organization;

  @Exclude({ toPlainOnly: true })
  policy: Policy;

  @Exclude({ toPlainOnly: true })
  account: Account;

  @Exclude({ toPlainOnly: true })
  role: Role;
}
