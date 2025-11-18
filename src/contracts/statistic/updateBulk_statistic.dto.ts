import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsOptional, IsUUID } from 'class-validator';

export class StatisticUpdateBulkDto {
  @ApiProperty({
    description: 'Id обновляемых статистик',
    required: false, // Измените на false
    example: ['099f554d-3539-4c7c-b4ae-dc7bea092f22'],
  })
  @IsOptional() // Добавьте это
  @IsArray({ message: 'Должен быть массив!' })
  @IsUUID('4', { each: true, message: 'Каждый элемент должен быть UUID v4' })
  ids?: string[]; // Сделайте необязательным
}