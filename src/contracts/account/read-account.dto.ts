import { ApiProperty } from '@nestjs/swagger';
import { Convert } from 'src/domains/convert.entity';
import { Goal } from 'src/domains/goal.entity';
import { Group } from 'src/domains/group.entity';
import { Objective } from 'src/domains/objective.entity';
import { Organization } from 'src/domains/organization.entity';
import { Policy } from 'src/domains/policy.entity';
import { PolicyDirectory } from 'src/domains/policyDirectory.entity';
import { Post } from 'src/domains/post.entity';
import { Project } from 'src/domains/project.entity';
import { RoleSetting } from 'src/domains/roleSetting.entity';
import { Statistic } from 'src/domains/statistic.entity';
import { Strategy } from 'src/domains/strategy.entity';
import { User } from 'src/domains/user.entity';

/**
 * DTO для чтения данных аккаунта.
 *
 * {@link Account | Account}
 */
export class AccountReadDto {
  @ApiProperty({
    description: 'ID аккаунта',
    example: 'a1118813-8985-465b-848e-9a78b1627f11',
  })
  id: string;

  @ApiProperty({ description: 'Имя аккаунта', example: 'OOO PIPKA' })
  accountName: string;

  @ApiProperty({ description: 'ID из академии' })
  tenantId: string;

  @ApiProperty({
    description: 'Время создания',
    example: '2024-09-16 15:53:29.593552',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Время последнего обновления',
    example: '2024-09-16 15:53:29.593552',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Список ID пользователей, принадлежащих аккаунту',
    isArray: true,
  })
  users: User[];

  organizations: Organization[];
  goals: Goal[];
  objectives: Objective[];
  policies: Policy[];
  projects: Project[];
  strategies: Strategy[];
  posts: Post[];
  statistics: Statistic[];
  roleSettings: RoleSetting[];
  policyDirectories: PolicyDirectory[];
  converts: Convert[];
  groups: Group[];
}
