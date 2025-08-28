import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  ValidateIf,
} from 'class-validator';
import { Statistic } from 'src/domains/statistic.entity';
import { CorrelationType } from 'src/domains/statisticData.entity';

export class StatisticDataCreateDto {
  // @ApiProperty({ description: 'Значение', required: true, example: 3500 })
  // @IsNumber()
  // @IsNotEmpty({ message: 'Значение не может быть пустым!' })
  // value: number;
  @ApiProperty({
      description: 'Значение',
      required: false, // ← меняем на false
      example: 3500,
      nullable: true,  // ← добавляем для Swagger
      type: Number,    // ← явно указываем тип
    })
    @IsOptional()     // ← добавляем IsOptional
    @ValidateIf((o) => o.value !== null) // ← валидируем только если не null
    @IsNumber({}, { message: 'Значение должно быть числом' })
    value?: number | null; // ← меняем тип и делаем optional


  @ApiProperty({
    description: 'Дата значения',
    required: true,
    example: '2024-10-10 18:26:17.301486',
  })
  @Type(() => Date)
  @IsDate()
  @IsNotEmpty({ message: 'Дата не может быть пустым!' })
  valueDate: Date;

  @ApiProperty({
    description: 'Тип корреляционного значения',
    required: false,
    example: 'Месяц',
    examples: ['Месяц', 'Год'],
  })
  @IsOptional()
  @IsEnum(CorrelationType)
  correlationType?: CorrelationType;

  @Exclude({ toPlainOnly: true })
  statistic: Statistic;
}

// add DATA
