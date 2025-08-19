import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Message } from 'src/domains/message.entity';
import { Target } from 'src/domains/target.entity';

export class AttachmentCreateDto {
  @ApiProperty({
    description: 'Название вложения',
    required: true,
    example: 'Галя_nudes.jpg',
  })
  @IsString()
  @MaxLength(255, {
    message: 'Название вложения должно быть не более 255 символов!',
  })
  @IsNotEmpty({ message: 'Название вложения не может быть пустым!' })
  attachmentName: string;

  @ApiProperty({
    description: 'Путь к вложению',
    required: true,
    example: 'uploads/1737988764326-photo_2022-03-13_23-16-33.jpg',
  })
  @IsString()
  @IsNotEmpty({ message: 'Путь к вложению не может быть пустым!' })
  attachmentPath: string;

  @ApiProperty({
    description: 'Размер вложения',
    required: true,
    example: 345561,
  })
  @IsNumber()
  @IsNotEmpty({ message: 'Размер вложения не может быть пустым' })
  attachmentSize: number;

  @ApiProperty({
    description: 'Расширение вложения',
    required: true,
    example: 'image/jpeg',
  })
  @IsString()
  @IsNotEmpty({ message: 'Тип вложения не может быть пустым!' })
  attachmentMimetype: string;

  @ApiProperty({
    description: 'Оригинальное название',
    required: true,
    example: 'original',
  })
  @IsString()
  @IsNotEmpty({ message: 'Оригинальное названиe не может быть пустым!' })
  originalName: string;

  @ApiProperty({
    description: 'Хеш файла',
    required: true,
    example: '2sad2828dfs99sdg99s9df9s9d9dhh888',
  })
  @IsString()
  @IsNotEmpty()
  hash: string;

  @ApiProperty({
    description: 'Id задачи',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  @IsNotEmpty({ message: 'Id задачи не может быть пустым!' })
  targetId?: string;

  @ApiProperty({
    description: 'Id сообщения',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  @IsNotEmpty({ message: 'Id сообщения не может быть пустым!' })
  messageId?: string;

  @Exclude({ toPlainOnly: true })
  target: Target;

  @Exclude({ toPlainOnly: true })
  message: Message;
}
