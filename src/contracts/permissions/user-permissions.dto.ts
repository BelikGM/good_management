import { ApiProperty } from '@nestjs/swagger';
import { ModulePermissionsDto } from './module-permissions.dto';

export class UserPermissionsDto {
  @ApiProperty({ 
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID пользователя'
  })
  userId: string;

  @ApiProperty({
    type: [ModulePermissionsDto],
    description: 'Массив прав доступа по модулям',
  })
  permissions: ModulePermissionsDto[];
}