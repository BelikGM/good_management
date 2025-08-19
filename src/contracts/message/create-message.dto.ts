import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Convert } from 'src/domains/convert.entity';
import { Post } from 'src/domains/post.entity';

export class MessageCreateDto {
  @ApiProperty({
    description: 'Текст сообщения',
    required: true,
    example: 'Текст',
  })
  @IsString()
  @MaxLength(4096, { message: 'Сообщение не может быть больше 4096 символов' })
  @IsNotEmpty({ message: 'Текст сообщения не может быть пустым!' })
  content: string;

  @ApiProperty({
    description: 'Id поста отправителя',
    required: true,
    example: '22dcf96d-1e6a-4c8c-bc12-c90589b40e93',
  })
  @IsUUID()
  @IsNotEmpty({ message: 'Id отправителя не может быть пустым!' })
  postId: string;

  @ApiProperty({
    description: 'Ids вложений',
    required: false,
    example: ['22dcf96d-1e6a-4c8c-bc12-c90589b40e93'],
  })
  @IsOptional()
  @IsArray({ message: 'Должен быть массив!' })
  @IsUUID('4', { each: true, message: 'Каждый элемент должен быть UUID v4' })
  attachmentIds?: string[];

  @Exclude({ toPlainOnly: true })
  convert: Convert;

  @Exclude({ toPlainOnly: true })
  sender: Post;
}
