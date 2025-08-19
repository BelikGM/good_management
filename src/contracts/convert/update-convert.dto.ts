import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsBoolean,
  IsDate,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { PathConvert } from 'src/domains/convert.entity';
import { Post } from 'src/domains/post.entity';
// import { ConvertToUserCreateDto } from "../convertToUser/create-convertToUser.dto";

export class ConvertUpdateDto {
  @ApiProperty({
    description: 'Id обновляемого конверта',
    required: true,
    example: '27b360b3-7caf-48bd-a91a-5f7adef327de',
  })
  @IsUUID()
  @IsNotEmpty({ message: 'Id конверта не может быть пустым!' })
  _id: string;

  @ApiProperty({
    description: 'Тема конверта',
    required: false,
    example: 'Тема',
  })
  @IsOptional()
  @IsString()
  @MaxLength(1024, {
    message: 'Тема конверта должна быть не более 1024 символа',
  })
  @IsNotEmpty({ message: 'Тема не может быть пустой!' })
  convertTheme?: string;

  @ApiProperty({
    description: 'Список ids постов, которые участники',
    required: false,
    example: [
      '323e4567-e89b-12d3-a456-426614174000',
      '750e8400-e29b-41d4-a716-446655440000',
    ],
  })
  @IsOptional()
  @IsUUID('4', { each: true })
  @ArrayMinSize(2, { message: 'Участников должно быть не меньше двух!' })
  convertToPostIds?: string[];

  @ApiProperty({
    description: 'Id активного поста',
    required: false,
    example: '27b360b3-7caf-48bd-a91a-5f7adef327de',
  })
  @IsOptional()
  @IsUUID()
  @IsNotEmpty({ message: 'Id конверта не может быть пустым!' })
  activePostId?: string;

  @ApiProperty({
    description: 'Список ids постов, которые наблюдатели',
    required: false,
    example: [
      '323e4567-e89b-12d3-a456-426614174000',
      '750e8400-e29b-41d4-a716-446655440000',
    ],
  })
  @IsOptional()
  @IsUUID('4', { each: true })
  @IsNotEmpty({ message: 'Массив наблюдателей не может быть пустым!' })
  watcherIds?: string[];

  @ApiProperty({
    description: 'Статус завершения конверта',
    required: false,
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  convertStatus?: boolean;

  @ApiProperty({
    description: 'Дедлайн',
    required: false,
    example: '2025-09-16 17:03:31.000111',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  deadline?: Date;

  @Exclude({ toPlainOnly: true })
  pathOfPosts?: string[];

  @Exclude({ toPlainOnly: true })
  convertPath?: PathConvert;

  @Exclude({ toPlainOnly: true })
  host?: Post;

  @Exclude({ toPlainOnly: true })
  targetId?: string;
}
