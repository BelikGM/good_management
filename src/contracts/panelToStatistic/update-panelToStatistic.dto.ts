import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsUUID } from 'class-validator';

export class PanelToStatisticUpdateDto {
  @ApiProperty({
    description: 'Id объекта связывающего статистику и панель',
    required: true,
    example: '099f554d-3539-4c7c-b4ae-dc7bea092f22',
  })
  @IsUUID()
  @IsNotEmpty({ message: 'ID не может быть пустым!' })
  _id: string;

  @ApiProperty({
    description: 'Порядковый номер',
    required: true,
    example: 22,
  })
  @IsNumber()
  @IsNotEmpty({ message: 'Номер не может быть пустым!' })
  orderStatisticNumber: number;
}
