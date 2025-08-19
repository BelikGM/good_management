import { ApiProperty } from '@nestjs/swagger';

export class RoleSettingUpdateDto {
  @ApiProperty({
    description: 'Id настройки доступа для роли',
    required: true,
    example: '253a5f99-376b-4774-b118-ca151d2685ca',
  })
  id: string;

  @ApiProperty({ description: 'Флаг на чтение', required: true, example: true })
  can_read: boolean;

  @ApiProperty({
    description: 'Флаг на создание',
    required: true,
    example: true,
  })
  can_create: boolean;

  @ApiProperty({
    description: 'Флаг на обновление',
    required: true,
    example: true,
  })
  can_update: boolean;
}
