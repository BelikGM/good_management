import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { State, Type as PolicyType } from 'src/domains/policy.entity';

export class PolicyUpdateDto {
  @ApiProperty({
    description: 'Id обновляемой политики',
    required: true,
    example: '0ba305e6-1d80-4ff6-a436-93d118f99993',
  })
  @IsUUID()
  @IsNotEmpty({ message: 'ID политики не может быть пустым!' })
  _id: string;

  @ApiProperty({
    description: 'Название политики',
    required: false,
    example: 'Политика',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Название политики не может быть пустым!' })
  policyName?: string;

  @ApiProperty({
    description: 'Состояние политики',
    required: false,
    example: 'Черновик',
    examples: ['Черновик', 'Активный', 'Отменён'],
  })
  @IsOptional()
  @IsEnum(State)
  state?: State;

  @ApiProperty({
    description: 'Тип политики',
    required: false,
    example: PolicyType.DIRECTIVE,
    examples: ['Директива', 'Инструкция', 'Распоряжение'],
  })
  @IsOptional()
  @IsEnum(PolicyType)
  type?: PolicyType;

  @ApiProperty({
    description: 'HTML контент политики',
    required: false,
    example: 'HTML контент (любая строка пройдет)',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Содержание политики не может быть пустым!' })
  content?: string;

  @ApiProperty({
    description: 'Дедлайн распоряжения',
    required: false,
    example: '2025-09-16 17:03:31.000111',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  deadline?: Date;
}
