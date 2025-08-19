import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Account } from 'src/domains/account.entity';
import { Organization } from 'src/domains/organization.entity';
import { Post } from 'src/domains/post.entity';

export class StrategyCreateDto {
  @ApiProperty({ description: 'Контент стратегии', example: 'HTML текст' })
  @IsString()
  @IsNotEmpty({ message: 'Содержание стратегии не может быть пустым!' })
  content: string;

  @Exclude({ toPlainOnly: true })
  postCreator: Post;

  @Exclude({ toPlainOnly: true })
  account: Account;

  @Exclude({ toPlainOnly: true })
  organization: Organization;

  @ApiProperty({
    description: 'ID организации, с которым связать стратегию',
    example: '865a8a3f-8197-41ee-b4cf-ba432d7fd51f',
  })
  @IsUUID()
  @IsNotEmpty({ message: 'Выберите организацию!' })
  organizationId: string;
}
