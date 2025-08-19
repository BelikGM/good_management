import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Convert } from 'src/domains/convert.entity';
import { Policy } from 'src/domains/policy.entity';
import { Post } from 'src/domains/post.entity';
import { Project } from 'src/domains/project.entity';
import { State, Type as TypeTarget } from 'src/domains/target.entity';

@ApiExtraModels()
export class TargetCreateDto {
  @ApiProperty({
    description: 'Тип задачи',
    required: false,
    default: 'Задача',
    example: 'Задача',
    examples: [
      'Задача',
      'Метрика',
      'Правила',
      'Продукт',
      'Организационные мероприятия',
      'Приказ',
    ],
  })
  @IsOptional()
  @IsEnum(TypeTarget)
  type?: TypeTarget;

  @ApiProperty({
    description: 'Порядковый номер задачи (минимум 1)',
    required: true,
    example: 1,
  })
  @IsNumber()
  @Min(1)
  orderNumber: number;

  @ApiProperty({
    description: 'Содержание задачи',
    required: true,
    example: 'Контент задачи',
  })
  @IsString()
  @IsNotEmpty({ message: 'Задача не может быть пустой!' })
  content: string;

  @ApiProperty({
    description: 'Id ответственного поста',
    required: false,
    example: 'a065a77a-36b0-4aea-9af4-5b313e550c19',
  })
  @IsOptional()
  @IsUUID(undefined, { message: 'Неверный формат UUID' })
  holderPostId?: string;

  @ApiProperty({
    description: 'Id политики',
    required: false,
    example: '0d081ac3-200f-4c7c-adc8-d11f1f66b20a',
  })
  @IsOptional()
  @IsUUID(undefined, { message: 'Неверный формат UUID' })
  policyId?: string;

  @ApiProperty({
    description: 'Ids файлов',
    required: false,
    example: ['0d081ac3-200f-4c7c-adc8-d11f1f66b20a'],
  })
  @IsOptional()
  @IsArray()
  attachmentIds?: string[];

  @ApiProperty({
    description: 'Состояние задачи',
    required: false,
    example: 'Черновик',
    default: 'Черновик',
    examples: ['Отменена', 'Завершена', 'Активная', 'Черновик'],
  })
  @IsOptional()
  @IsEnum(State)
  targetState?: State;

  @ApiProperty({
    description: 'Дата начала выполнения (default: new Date())',
    required: false,
    default: new Date(),
    example: '2024-09-16 17:03:31.000111',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateStart?: Date;

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
  holderPost: Post;

  @Exclude({ toPlainOnly: true })
  project: Project;

  @Exclude({ toPlainOnly: true })
  policy: Policy;

  @Exclude({ toPlainOnly: true })
  convert: Convert;
}
