import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import { Account } from 'src/domains/account.entity';
import { Post } from 'src/domains/post.entity';
import { Type as TypeStatistic } from 'src/domains/statistic.entity';
import {
  ArrayNotEmpty,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { StatisticDataCreateDto } from '../statisticData/create-statisticData.dto';

export class StatisticCreateDto {
  @IsOptional()
  @IsUUID()
  @IsNotEmpty({ message: 'ID статистики не может быть пустым!' })
  id?: string;

  @ApiProperty({
    description: 'Тип статистики',
    required: false,
    default: 'Прямая',
    example: 'Прямая',
    examples: ['Прямая', 'Обратная'],
  })
  @IsOptional()
  @IsEnum(TypeStatistic)
  type?: TypeStatistic;

  @ApiProperty({
    description: 'Название статистики',
    required: true,
    example: 'Название',
  })
  @IsString()
  @IsNotEmpty({ message: 'У статистики должно быть название!' })
  name: string;

  @ApiProperty({
    description: 'Описание',
    required: false,
    example: 'Описание',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Описание статистики не может быть пустым!' })
  description?: string;

  @ApiProperty({
    description: 'Id поста, к которому привязать статистику',
    required: true,
    example: '2420fabb-3e37-445f-87e6-652bfd5a050c',
  })
  @IsUUID()
  @IsNotEmpty({ message: 'ID поста не может быть пустым!' })
  postId: string;

  @Exclude({ toPlainOnly: true })
  post: Post;

  @Exclude({ toPlainOnly: true })
  account: Account;

  @ApiProperty({
    description: 'Значения статистики',
    required: false,
    example: [
      {
        value: 4500,
        valueDate: '2024-09-26 15:54:37.211744',
        correlationType: 'Год',
      },
      {
        value: 5000,
        valueDate: '2024-09-26 15:54:37.211744',
        correlationType: null,
      },
    ],
  })
  @IsOptional()
  @IsArray({ message: 'Должно быть массивом!' })
  @ValidateNested()
  @Type(() => StatisticDataCreateDto)
  @ArrayNotEmpty({ message: 'Добавьте хотя бы одно значение для статистики!' })
  statisticDataCreateDtos?: StatisticDataCreateDto[];
}
