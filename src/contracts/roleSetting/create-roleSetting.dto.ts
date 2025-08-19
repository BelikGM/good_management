import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsBoolean, IsEnum, IsNotEmpty, IsUUID } from 'class-validator';
import { Account } from 'src/domains/account.entity';
import { Role } from 'src/domains/role.entity';
import { Modules } from 'src/domains/roleSetting.entity';

export class RoleSettingCreateDto {
  @ApiProperty({
    description: 'Название модуля',
    required: true,
    example: 'policy',
    examples: [
      'policy',
      'goal',
      'objective',
      'strategy',
      'project',
      'post',
      'statistic',
    ],
  })
  @IsEnum(Modules)
  module: Modules;

  @ApiProperty({ description: 'Флаг на чтение', required: true, example: true })
  @IsBoolean()
  can_read: boolean;

  @ApiProperty({
    description: 'Флаг на создание',
    required: true,
    example: true,
  })
  @IsBoolean()
  can_create: boolean;

  @ApiProperty({
    description: 'Флаг на обновление',
    required: true,
    example: true,
  })
  @IsBoolean()
  can_update: boolean;

  @ApiProperty({
    description: 'Флаг на обновление',
    required: true,
    example: '8ae9e534-4617-4b70-95f4-16d4a984cae2',
  })
  @IsUUID()
  roleId: string;

  @Exclude({ toPlainOnly: true })
  role: Role;

  @Exclude({ toPlainOnly: true })
  account: Account;
}

// related to ACCOUNT
