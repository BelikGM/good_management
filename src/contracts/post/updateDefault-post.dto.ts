import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class PostUpdateDefaultDto {
  @ApiProperty({
    description: 'Id поста',
    required: true,
    example: '2420fabb-3e37-445f-87e6-652bfd5a050c',
  })
  @IsNotEmpty({ message: 'ID обновляемого поста не может быть пустым!' })
  @IsUUID()
  _id: string;

  @ApiProperty({
    description: 'Id нового дефолтного поста',
    required: true,
    example: '2420fabb-3e37-445f-87e6-652bfd5a050c',
  })
  @IsNotEmpty({ message: 'ID нового поста не может быть пустым!' })
  @IsUUID()
  newDefaultPostId: string;
}
