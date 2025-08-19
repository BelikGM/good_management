import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Organization } from './organization.entity';
import { User } from './user.entity';
import { Goal } from './goal.entity';
import { Objective } from './objective.entity';
import { Policy } from './policy.entity';
import { Project } from './project.entity';
import { Strategy } from './strategy.entity';
import { Post } from './post.entity';
import { Statistic } from './statistic.entity';
import { RoleSetting } from './roleSetting.entity';
import { PolicyDirectory } from './policyDirectory.entity';
import { Convert } from './convert.entity';
import { Group } from './group.entity';

/**
 * Основная сущность Account.
 * Представляет учетную запись кампании.
 */
@Entity()
export class Account {
  /**
   * Уникальный идентификатор аккаунта.
   *
   * @remarks
   * Поле автоматически генерируется и имеет формат UUID v4.0.
   *
   * @example
   * '550e8400-e29b-41d4-a716-446655440000'
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Название аккаунта.
   *
   * @remarks
   * nullable: false, length: 120
   *
   * @example
   * 'Академия'
   */
  @Column({ nullable: false, length: 120 })
  accountName: string;

  /**
   * Идентификатор собственника в БД академии (tenant ID).
   *
   * @remarks
   * Должен быть валидным UUID. unique: true, nullable: true.
   *
   * @example
   * '123e4567-e89b-12d3-a456-426614174000'
   */
  @Column({ type: 'uuid', nullable: true, unique: true })
  tenantId: string;

  /**
   * Дата и время создания аккаунта.
   *
   * @remarks
   * Поле автоматически заполняется при создании.
   *
   * @example
   * '2024-06-01T12:34:56Z'
   */
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  /**
   * Дата и время последнего обновления аккаунта.
   *
   * @remarks
   * Поле автоматически обновляется при каждом изменении записи.
   *
   * @example
   * '2024-06-10T08:15:30Z'
   */
  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  /**
   * Связь с пользователями (1:М User).
   */
  @OneToMany(() => User, (user) => user.account)
  users: User[];

  /**
   * Связь с организациями (1:M Organization).
   */
  @OneToMany(() => Organization, (organization) => organization.account)
  organizations: Organization[];

  /**
   * Связь с целями (1:M Goal).
   */
  @OneToMany(() => Goal, (goal) => goal.account)
  goals: Goal[];

  /**
   * Связь с задачами (1:M Objective).
   */
  @OneToMany(() => Objective, (objective) => objective.account)
  objectives: Objective[];

  /**
   * Связь с политиками (1:M Policy).
   */
  @OneToMany(() => Policy, (policy) => policy.account)
  policies: Policy[];

  /**
   * Связь с проектами (1:M Project).
   */
  @OneToMany(() => Project, (project) => project.account)
  projects: Project[];

  /**
   * Связь со стратегиями (1:M Strategy).
   */
  @OneToMany(() => Strategy, (strategy) => strategy.account)
  strategies: Strategy[];

  /**
   * Связь с должностями (1:M Post).
   */
  @OneToMany(() => Post, (post) => post.account)
  posts: Post[];

  /**
   * Связь со статистикой (1:M Statistic).
   */
  @OneToMany(() => Statistic, (statistic) => statistic.account)
  statistics: Statistic[];

  /**
   * Связь с настройками ролей (1:M RoleSetting).
   */
  @OneToMany(() => RoleSetting, (roleSetting) => roleSetting.account)
  roleSettings: RoleSetting[];

  /**
   * Связь с директориями политик (1:M PolicyDirectory).
   */
  @OneToMany(
    () => PolicyDirectory,
    (policyDirectory) => policyDirectory.account,
  )
  policyDirectories: PolicyDirectory[];

  /**
   * Связь с конвертациями (1:M Convert).
   */
  @OneToMany(() => Convert, (convert) => convert.account)
  converts: Convert[];

  /**
   * Связь с группами (1:M Group).
   */
  @OneToMany(() => Group, (group) => group.account)
  groups: Group[];
}
