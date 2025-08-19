import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Account } from 'src/domains/account.entity';
import { PathConvert, TypeConvert } from 'src/domains/convert.entity';
import { TargetCreateDto } from '../target/create-target.dto';
import { Post } from 'src/domains/post.entity';

export class ConvertCreateDto {
  @ApiProperty({
    description: 'Тема конверта',
    required: true,
    example: 'Тема',
  })
  @IsString()
  @MaxLength(1024, {
    message: 'Тема конверта должна быть не более 1024 символа',
  })
  @IsNotEmpty({ message: 'Тема не может быть пустой!' })
  convertTheme: string;

  @Exclude({ toPlainOnly: true })
  pathOfPosts: string[];

  @ApiProperty({
    description: 'Дедлайн',
    required: false,
    example: '2025-09-16 17:03:31.000111',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  deadline?: Date;

  @ApiProperty({
    description: 'Тип конверта',
    required: true,
    example: TypeConvert.ORDER,
    examples: [TypeConvert.CHAT, TypeConvert.ORDER, TypeConvert.PROPOSAL],
  })
  @IsEnum(TypeConvert)
  @IsNotEmpty({ message: 'Тип конверта не может быть пустой!' })
  convertType: TypeConvert;

  @Exclude({ toPlainOnly: true })
  convertPath: PathConvert;

  @ApiProperty({
    description: 'Id поста отправителя',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Id поста отправителя не может быть пустой!' })
  senderPostId: string;

  @ApiProperty({
    description: 'Id поста получителя',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'Id поста получителя не может быть пустой!' })
  reciverPostId: string;

  @ApiProperty({
    description:
      'Текст для сообщения при convertType === Переписька или === Заявка',
    example: 'Заявка на трусы',
    required: false,
    nullable: true,
  })
  @IsString()
  messageContent: string | null;

  @Exclude({ toPlainOnly: true })
  host: Post;

  @Exclude({ toPlainOnly: true })
  account: Account;

  @ApiProperty({
    description: 'Список задач',
    required: false,
    example: {
      type: 'Приказ',
      orderNumber: 1,
      content: 'Контент задачи',
      holderPostId: 'c92895e6-9496-4cb5-aa7b-e3c72c18934a',
      attachmentIds: ['222895e6-9496-4cb5-aa7b-e3c72c18934a'],
      dateStart: '2024-09-18T14:59:47.010Z',
      deadline: '2024-09-18T14:59:47.010Z',
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => TargetCreateDto)
  targetCreateDto?: TargetCreateDto;

  @Exclude({ toPlainOnly: true })
  targetId?: string;
}
