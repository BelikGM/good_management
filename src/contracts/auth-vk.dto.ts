import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
} from 'class-validator';
export class AuthVK {
  @ApiProperty({ description: 'Авторизационный код от ВК' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'Фингерпринт браузера клиента' })
  @IsString()
  fingerprint: string;

  @ApiProperty({
    description:
      'Верификатор, который обеспечивает защиту передаваемых данных.',
  })
  @IsString()
  code_verifier: string;

  @ApiProperty({
    description:
      'Уникальный идентификатор устройства, полученный вместе с авторизационным кодом',
  })
  @IsString()
  device_id: string;

  @ApiProperty({ description: 'Строка состояния в виде случайной строки' })
  @IsString()
  state: string;
}
