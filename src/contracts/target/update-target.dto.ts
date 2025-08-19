import { ApiExtraModels, ApiProperty } from '@nestjs/swagger';
import { Exclude, Transform, TransformFnParams, Type } from 'class-transformer';
import {
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
import { State, Type as TargetType } from 'src/domains/target.entity';

@ApiExtraModels()
export class TargetUpdateDto {
  @ApiProperty({
    description: 'Id обновляемой задачи',
    required: true,
    example: '0d081ac3-200f-4c7c-adc8-d11f1f66b20a',
  })
  @IsUUID()
  @IsNotEmpty({ message: 'Id не может быть пустой' })
  _id: string;

  @ApiProperty({
    description: 'Содержание задачи',
    required: false,
    example: 'Контент задачи',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Задача не может быть пустой!' })
  @Transform(({ value }: TransformFnParams) => value?.trim())
  content?: string;

  @ApiProperty({
    description: 'Порядковый номер задачи (минимум 1)',
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  orderNumber?: number;

  @ApiProperty({
    description: 'Id ответственного поста',
    required: false,
    example: '0d081ac3-200f-4c7c-adc8-d11f1f66b20a',
  })
  // @IsRequiredIfActive()
  @IsOptional()
  @IsUUID()
  @IsNotEmpty({ message: 'Id ответственного поста не может быть пустым' })
  holderPostId?: string;

  @ApiProperty({
    description: 'Id политики',
    required: false,
    example: '0d081ac3-200f-4c7c-adc8-d11f1f66b20a',
  })
  @IsOptional()
  @IsUUID()
  @IsNotEmpty({ message: 'Id политики не может быть пустым' })
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
    example: 'Отменена',
    examples: ['Отменена', 'Завершена'],
  })
  @IsOptional()
  @IsEnum(State)
  targetState?: State;

  @IsEnum(TargetType)
  type: TargetType;

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
    nullable: true,
    example: '2025-09-16 17:03:31.000111',
  })
  // @IsRequiredIfActive()
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  deadline?: Date;

  @IsOptional()
  @Type(() => Convert)
  convert?: Convert;

  @Exclude({ toPlainOnly: true })
  holderPost: Post;

  @Exclude({ toPlainOnly: true })
  policy: Policy;

  @Exclude({ toPlainOnly: true })
  dateComplete: Date;
}
