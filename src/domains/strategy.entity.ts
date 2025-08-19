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
import { Objective } from './objective.entity';
import { Project } from './project.entity';
import { Account } from './account.entity';
import { Organization } from './organization.entity';
import { Post } from './post.entity';

/**
 * Перечисление состояний стратегий.
 */
export enum State {
  DRAFT = 'Черновик',
  ACTIVE = 'Активный',
  REJECTED = 'Завершено',
}

/**
 * Сущность, представляющая стратегию.
 */
@Entity()
export class Strategy {
  /**
   * Уникальный идентификатор.
   *
   * @remarks
   * Поле автоматически генерируется в формате UUID v4.0.
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Порядковый номер стратегии в организации.
   *
   * @remarks
   * Инркемент в БД.
   */
  @Column({ nullable: false })
  strategyNumber: number;

  /**
   * Дата активации стратегии.
   *
   * @remarks
   * Устанавливается в момент перехода в состояние "активная" (ACTIVE)
   */
  @Column({ type: 'timestamp', nullable: true })
  dateActive: Date;

  /**
   * Содержание стратегии.
   *
   * @remarks
   * nullable: false.
   */
  @Column({ type: 'text', nullable: false })
  content: string;

  /**
   * Состояние стратегии.
   *
   * @remarks
   * Используется перечисление `State`. По умолчанию установлено значение черновик(DRAFT). nullable: false
   */
  @Column({
    type: 'enum',
    enum: State,
    default: State.DRAFT,
    nullable: false,
  })
  state: State;

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
   * Связь с сущностью M:1 Post.
   *
   * @remarks
   * nullable: false
   */
  @ManyToOne(() => Post, (postCreator) => postCreator.strategies, {
    nullable: false,
  })
  postCreator: Post;

  /**
   * Связь с сущностью M:1 Account.
   *
   * @remarks
   * nullable: false
   */
  @ManyToOne(() => Account, (account) => account.strategies, {
    nullable: false,
  })
  account: Account;

  /**
   * Связь с сущностью M:1 Organization.
   */
  @ManyToOne(() => Organization, (organization) => organization.strategies)
  organization: Organization;

  /**
   * Связь с сущностью 1:1 Objective.
   */
  @OneToOne(() => Objective, (objective) => objective.strategy)
  objective: Objective;

  /**
   * Связь с сущностью 1:М Project.
   */
  @OneToMany(() => Project, (project) => project.strategy)
  projects: Project[];
}
