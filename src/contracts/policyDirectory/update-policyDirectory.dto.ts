import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class PolicyDirectoryUpdateDto {
  @ApiProperty({
    description: 'Название папки',
    required: false,
    example: 'Папка политик для отдела продаж',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Название папки не может быть пустым!' })
  directoryName?: string;

  @ApiProperty({
    description: 'Ids политик, которые добавить в папку',
    required: false,
  })
  @IsOptional()
  @IsArray({ message: 'Должен быть массив!' })
  @IsUUID('4', { each: true, message: 'Каждый элемент должен быть UUID v4' })
  @ArrayNotEmpty({ message: 'Выберите хотя бы одну политику!' })
  policyToPolicyDirectories?: string[];
}
