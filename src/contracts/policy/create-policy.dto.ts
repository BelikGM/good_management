import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Account } from 'src/domains/account.entity';
import { Organization } from 'src/domains/organization.entity';
import { Post } from 'src/domains/post.entity';

export class PolicyCreateDto {
  @ApiProperty({ description: 'Название политики', example: 'Политика' })
  @IsString()
  @IsNotEmpty({ message: 'Название политики не может быть пустым!' })
  policyName: string;

  @ApiProperty({
    description: 'HTML контент политики',
    required: true,
    example: 'HTML контент (любая строка пройдет)',
  })
  @IsString()
  @IsNotEmpty({ message: 'Содержание политики не может быть пустым!' })
  content: string;

  @Exclude({ toPlainOnly: true })
  postCreator: Post;

  @Exclude({ toPlainOnly: true })
  account: Account;

  @Exclude({ toPlainOnly: true })
  organization: Organization;

  @ApiProperty({
    description: 'ID организации, к которой привязать политику',
    example: '2d1cea4c-7cea-4811-8cd5-078da7f20167',
  })
  @IsUUID()
  @IsNotEmpty({ message: 'ID организации не может быть пустым!' })
  organizationId: string;
}
