import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
import { Account } from './account.entity';
import { User } from './user.entity';
import { Post } from './post.entity';
import { Goal } from './goal.entity';
import { Strategy } from './strategy.entity';
import { Project } from './project.entity';
import { Policy } from './policy.entity';
import { ControlPanel } from './controlPanel.entity';

/**
 * Перечисление дней недели для отчетов.
 *
 * @remarks
 * Значения представляют числовые эквиваленты дней недели, начиная с воскресенья (0), понедельник (1) и т.д.
 */
export enum ReportDay {
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SUNDAY = 6,
  SATURDAY = 0,
}

/**
 * Сущность Organization (Организация).
 *
 * Представляет организацию в аккаунте.
 */
@Entity()
export class Organization {
  /**
   * Уникальный идентификатор организации.
   *
   * @remarks
   * Поле автоматически генерируется в формате UUID v4.0.
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Название организации.
   *
   * @remarks
   * nullable: false
   */
  @Column({ nullable: false })
  organizationName: string;

  /**
   * Идентификатор родительской организации.
   *
   * @remarks
   * type: uuid v4.0, nullable: true
   */
  @Column({ type: 'uuid', nullable: true })
  parentOrganizationId: string;

  /**
   * День недели для отчетности.
   *
   * @remarks
   * Используется перечисление `ReportDay`. По умолчанию установлено значение пятницы. nullable: false
   */
  @Column({
    type: 'enum',
    enum: ReportDay,
    default: ReportDay.FRIDAY,
    nullable: false,
  })
  reportDay: ReportDay;

  /**
   * Список кодов цветов, в которые красятся отделы.
   *
   * @remarks
   * Множество k=>v, где postId => colorCode'.
   *
   * @example
   * {uuid(postId): '#FFFFF'}
   */
  @Column({ type: 'hstore', hstoreType: 'object', nullable: true })
  colorCodes: Record<string, string>;

  /**
   * Код цвета организации.
   *
   * @remarks
   * nullable: true.
   *
   * @example
   * '#FFFFF'
   */
  @Column({ nullable: true, length: 10 })
  organizationColor: string;

  /**
   * Дата создания записи.
   *
   * @remarks
   * Поле автоматически заполняется при создании записи.
   *
   * @example
   * '2024-06-01T12:34:56Z'
   */
  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  /**
   * Дата последнего обновления записи.
   *
   * @remarks
   * Поле автоматически обновляется при изменении записи.
   *
   * @example
   * '2024-06-01T12:34:56Z'
   */
  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  /**
   * Связь с сущностью 1:1 Goal.
   */
  @OneToOne(() => Goal, (goal) => goal.organization)
  goal: Goal;

  /**
   * Связь с сущностью 1:M User.
   */
  @OneToMany(() => User, (user) => user.organization)
  users: User[];

  /**
   * Связь с сущностью 1:M Post (Должность).
   */
  @OneToMany(() => Post, (post) => post.organization)
  posts: Post[];

  /**
   * Связь с сущностью 1:M Policy.
   */
  @OneToMany(() => Policy, (policy) => policy.organization)
  policies: Policy[];

  /**
   * Связь с сущностью 1:M Project.
   */
  @OneToMany(() => Project, (project) => project.organization)
  projects: Project[];

  /**
   * Связь с сущностью 1:M Strategy.
   */
  @OneToMany(() => Strategy, (strategy) => strategy.organization)
  strategies: Strategy[];

  /**
   * Связь с сущностью 1:M ControlPanel.
   */
  @OneToMany(() => ControlPanel, (controlPanel) => controlPanel.organization)
  controlPanels: ControlPanel[];

  /**
   * Связь с сущностью M:1 Account.
   * @remarks
   * nullable: false.
   */
  @ManyToOne(() => Account, (account) => account.organizations, {
    nullable: false,
  })
  account: Account;
}
