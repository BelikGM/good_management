import { ApiProperty } from '@nestjs/swagger';
import { AttachmentToMessage } from 'src/domains/attachmentToMessage.entity';
import { AttachmentToTarget } from 'src/domains/attachmentToTarget.entity';

export class AttachmentReadDto {
  id: string;

  @ApiProperty({
    description: 'Название вложения',
    example: 'Галя_nudes.jpg',
  })
  attachmentName: string;

  @ApiProperty({
    description: 'Путь к вложению',
    example: 'uploads/1737988764326-photo_2022-03-13_23-16-33.jpg',
  })
  attachmentPath: string;

  @ApiProperty({
    description: 'Размер вложения',
    example: 345561,
  })
  attachmentSize: number;

  @ApiProperty({
    description: 'Расширение вложения',
    example: 'image/jpeg',
  })
  attachmentMimetype: string;

  @ApiProperty({
    description: 'Оригинальное название',
    example: 'original',
  })
  originalName: string;

  @ApiProperty({
    description: 'Хеш файла',
    example: '2sad2828dfs99sdg99s9df9s9d9dhh888',
  })
  hash: string;

  createdAt: Date;

  updatedAt: Date;

  attachmentToTargets: AttachmentToTarget[];

  attachmentToMessages: AttachmentToMessage[];
}
