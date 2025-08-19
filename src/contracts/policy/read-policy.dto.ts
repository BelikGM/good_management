import { ApiProperty } from '@nestjs/swagger';
import { Account } from 'src/domains/account.entity';
import { State, Type } from 'src/domains/policy.entity';
import { Post } from 'src/domains/post.entity';
import { PolicyToPolicyDirectory } from 'src/domains/policyToPolicyDirectories.entity';
import { Organization } from 'src/domains/organization.entity';
import { Target } from 'src/domains/target.entity';

export class PolicyReadDto {
  @ApiProperty({
    description: 'Id политики',
    example: 'bb1897ad-1e87-4747-a6bb-749e4bf49bf6',
  })
  id: string;

  @ApiProperty({
    description: 'Название политики',
    example: 'bb1897ad-1e87-4747-a6bb-749e4bf49bf6',
  })
  policyName: string;

  @ApiProperty({
    description: 'Номер политики',
    example: 'bb1897ad-1e87-4747-a6bb-749e4bf49bf6',
  })
  policyNumber: number;

  @ApiProperty({
    description: 'Состояние политики',
    example: 'bb1897ad-1e87-4747-a6bb-749e4bf49bf6',
  })
  state: State;

  @ApiProperty({
    description: 'Тип политики',
    example: 'bb1897ad-1e87-4747-a6bb-749e4bf49bf6',
  })
  type: Type;

  @ApiProperty({
    description: 'Дата активации политики',
    example: 'bb1897ad-1e87-4747-a6bb-749e4bf49bf6',
  })
  dateActive: Date;

  @ApiProperty({
    description: 'Контент политики',
    example: 'bb1897ad-1e87-4747-a6bb-749e4bf49bf6',
  })
  content: string;

  @ApiProperty({
    description: 'Дата создания политики',
    example: 'bb1897ad-1e87-4747-a6bb-749e4bf49bf6',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Дата обновления политики',
    example: 'bb1897ad-1e87-4747-a6bb-749e4bf49bf6',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Дедлайн распоряжения',
    required: false,
    example: '2025-09-16 17:03:31.000111',
  })
  deadline: Date;

  @ApiProperty({
    description: 'Связанные посты с политикой',
    example: ['bb1897ad-1e87-4747-a6bb-749e4bf49bf6'],
    nullable: true,
  })
  posts: Post[];

  @ApiProperty({ description: 'Связанная организация с политикой' })
  organization: Organization;

  @ApiProperty({ description: 'Пост создатель' })
  postCreator: Post;

  @ApiProperty({ description: 'Связанный аккаунт политики' })
  account: Account;

  @ApiProperty({ description: 'Связанные папки с политикой' })
  policyToPolicyDirectories: PolicyToPolicyDirectory[];

  @ApiProperty({ description: 'Связанные задачи с политикой' })
  targets: Target[];
}
