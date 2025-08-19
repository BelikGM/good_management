import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class GroupUpdateDto {
  @ApiProperty({ description: 'Название группы', example: 'Название группы' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  groupName?: string;

  @ApiProperty({
    description: 'Ids постов, которых добавить в группу',
    example: [
      '40ac6cc6-bca9-4ab1-859b-01fa0c79b6db',
      '5c993fc6-4e04-4ed1-8404-2aab65096a20',
    ],
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  postIds?: string[];
}
