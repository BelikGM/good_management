import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
} from 'class-validator';
import { CorrelationType } from 'src/domains/statisticData.entity';

export class StatisticDataUpdateDto {
  @ApiProperty({
    description: 'Id обновляемых данных',
    required: true,
    example: '099f554d-3539-4c7c-b4ae-dc7bea092f22',
  })
  @IsUUID()
  @IsNotEmpty({ message: 'ID обновляемых данных не может быть пустым!' })
  _id: string;

  @ApiProperty({ description: 'Значение', required: false, example: 3500 })
  @IsOptional()
  @IsNumber()
  @IsNotEmpty({ message: 'Значение не может быть пустым!' })
  value?: number;

  @ApiProperty({
    description: 'Дата значения',
    required: false,
    example: '2024-10-10 18:26:17.301486',
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty({ message: 'Дата не может быть пустым!' })
  valueDate?: Date;

  @ApiProperty({
    description: 'Тип корреляционного значения',
    required: false,
    example: 'Месяц',
    examples: ['Месяц', 'Год'],
  })
  @IsOptional()
  @IsEnum(CorrelationType)
  correlationType?: CorrelationType | null;
}

// add DATA
