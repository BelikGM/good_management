import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, MaxLength } from 'class-validator';

export class FileCreateDto {
  @ApiProperty({
    description: 'Название файла',
    required: true,
    example: 'Галя_nudes.jpg',
  })
  @IsString()
  @MaxLength(255, {
    message: 'Название файла должно быть не более 255 символов!',
  })
  @IsNotEmpty({ message: 'Название файла не может быть пустым!' })
  fileName: string;

  @ApiProperty({
    description: 'Путь к файлу',
    required: true,
    example: 'uploads/1737988764326-photo_2022-03-13_23-16-33.jpg',
  })
  @IsString()
  @IsNotEmpty({ message: 'Путь к файлу не может быть пустым!' })
  path: string;

  @ApiProperty({
    description: 'Размер файла',
    required: true,
    example: 345561,
  })
  @IsNumber()
  @IsNotEmpty({ message: 'Размер файла не может быть пустым' })
  size: number;

  @ApiProperty({
    description: 'Расширение файла',
    required: true,
    example: 'image/jpeg',
  })
  @IsString()
  @IsNotEmpty({ message: 'Тип файла не может быть пустым!' })
  mimetype: string;
}
