import { ApiProperty } from '@nestjs/swagger';
import { ArrayMinSize, IsUUID } from 'class-validator';

export class ConvertFinishDto {
  @ApiProperty({
    description: 'Маршрут ЮЗЕРОВ!!!! в конверте',
    required: true,
    example: [
      '323e4567-e89b-12d3-a456-426614174000',
      '750e8400-e29b-41d4-a716-446655440000',
    ],
  })
  @IsUUID('4', { each: true })
  @ArrayMinSize(2, { message: 'Участников должно быть не меньше двух!' })
  pathOfUsers: string[];
}
