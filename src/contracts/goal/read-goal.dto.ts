import { ApiProperty } from '@nestjs/swagger';
import { Account } from 'src/domains/account.entity';
import { Organization } from 'src/domains/organization.entity';
import { Post } from 'src/domains/post.entity';

export class GoalReadDto {
  @ApiProperty({ description: 'Id цели' })
  id: string;

  @ApiProperty({ description: 'Текст цели' })
  content: string[];

  @ApiProperty({ description: 'Дата создания' })
  createdAt: Date;

  @ApiProperty({ description: 'Дата последнего обновления' })
  updatedAt: Date;

  @ApiProperty({ description: 'Пост создатель' })
  postCreator?: Post;

  @ApiProperty({ description: 'Id связанного аккаунта' })
  account?: Account;

  @ApiProperty({ description: 'ID организации, принадлежащей цели' })
  organization?: Organization;
}
