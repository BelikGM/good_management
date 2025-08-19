import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsArray, IsNotEmpty, IsUUID } from 'class-validator';
import { Account } from 'src/domains/account.entity';
import { Organization } from 'src/domains/organization.entity';
import { Post } from 'src/domains/post.entity';

export class GoalCreateDto {
  @ApiProperty({
    description: 'Текст цели, состоящий из блоков',
    required: true,
    isArray: true,
    example: ['Контент цели', 'one more content'],
  })
  @IsArray()
  content: string[];

  @ApiProperty({
    description: 'ID организации, с которой связать цель',
    required: true,
    example: '2d1cea4c-7cea-4811-8cd5-078da7f20167',
  })
  @IsUUID()
  @IsNotEmpty({ message: 'ID организации не может быть пустой!' })
  organizationId: string;

  @Exclude({ toPlainOnly: true })
  postCreator: Post;

  @Exclude({ toPlainOnly: true })
  account: Account;

  @Exclude({ toPlainOnly: true })
  organization: Organization;
}
