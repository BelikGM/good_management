import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

/**
 * ДТО для создания аккаунта.
 * Это ДТО содержит все свойства, необходимые для создания аккаунта.
 */
export class AccountCreateDto {
  /**
   * Уникальный идентификатор аккаунта.
   *
   * @remarks
   * Значение должно быть валидным UUID v4.0.
   *
   * @example
   * '550e8400-e29b-41d4-a716-446655440000'
   */
  @ApiProperty({
    description: 'Id аккаунта',
    required: true,
  })
  @IsUUID()
  @IsNotEmpty({ message: 'Id аккаунта не может быть пустым' })
  id: string;

  /**
   * Название аккаунта.
   */
  @ApiProperty({
    description: 'Имя аккаунта',
    required: true,
  })
  @IsString()
  @MaxLength(120, {
    message: 'Название аккаунта должно быть не более 120 символов',
  })
  @IsNotEmpty({ message: 'Название аккаунта не может быть пустым' })
  accountName: string;

  /**
   * Идентификатор арендатора (tenant ID) из академии.
   */
  @ApiProperty({
    description: 'Id из академии',
    required: true,
  })
  @IsUUID()
  @IsNotEmpty({ message: 'tenantId аккаунта не может быть пустым' })
  tenantId: string;
}
