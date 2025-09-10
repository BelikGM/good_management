import { ApiProperty } from '@nestjs/swagger';
import { Modules } from 'src/domains/roleSetting.entity'; // Добавляем импорт

export class ModulePermissionsDto {
  @ApiProperty({ 
    example: 'post', 
    description: 'Название модуля',
    enum: Modules // Указываем enum для свагера
  })
  module: string;

  @ApiProperty({ example: true, description: 'Право на чтение' })
  canRead: boolean;

  @ApiProperty({ example: false, description: 'Право на создание' })
  canCreate: boolean;

  @ApiProperty({ example: true, description: 'Право на обновление' })
  canUpdate: boolean;
}