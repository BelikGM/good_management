import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class GoalUpdateDto {
  @ApiProperty({
    description: 'Id цели',
    required: true,
    example: '907b0875-d29d-4f84-89fe-6b037d1ecc7f',
  })
  @IsUUID()
  @IsNotEmpty({ message: 'ID цели не может быть пустым!' })
  _id: string;

  @ApiProperty({
    description: 'Текст цели',
    isArray: true,
    required: false,
    example: ['Новый контент', 'One more content'],
  })
  @IsOptional()
  @IsArray()
  content?: string[];
}
