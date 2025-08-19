import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from './post.entity';
import { Account } from './account.entity';
import { PolicyToPolicyDirectory } from './policyToPolicyDirectories.entity';
import { Organization } from './organization.entity';
import { Target } from './target.entity';

/**
 * Перечисление состояний политики.
 */
export enum State {
  /** Политика находится в состоянии черновика. */
  DRAFT = 'Черновик',

  /** Политика активна и применяется. */
  ACTIVE = 'Активный',

  /** Политика отменена. */
  REJECTED = 'Отменён',
}

/**
 * Перечисление типов политики.
 */
export enum Type {
  /** Политика является директивой. */
  DIRECTIVE = 'Директива',

  /** Политика является инструкцией. */
  INSTRUCTION = 'Инструкция',

  /** Политика является распоряжением. */
  DISPOSAL = 'Распоряжение',
}

/**
 * Сущность, представляющая политику.
 */
@Entity()
export class Policy {
  /**
   * Уникальный идентификатор политики.
   *
   * @remarks
   * Поле автоматически генерируется в формате UUID v4.0.
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Название политики.
   *
   * @remarks
   * nullable: false.
   */
  @Column({ nullable: false })
  policyName: string;

  /**
   * Порядковый номер политики.
   *
   * @remarks
   * Инкремент в БД.
   */
  @Column({ nullable: false })
  policyNumber: number;

  /**
   * Состояние политики.
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
   * Тип политики (директива или инструкция).
   *
   * @remarks
   * Используется перечисление `Type`. По умолчанию установлено значение директива(DIRECTIVE). nullable: false
   */
  @Column({
    type: 'enum',
    enum: Type,
    default: Type.DIRECTIVE,
    nullable: false,
  })
  type: Type;

  /**
   * Дата активации политики.
   *
   * @remarks
   * Устанавливается в момент перехода в состояние "активная" (ACTIVE)
   */
  @Column({ type: 'timestamp', nullable: true })
  dateActive: Date;

  /**
   * Дедлайн для распоряжения.
   */
  @Column({ type: 'timestamp', nullable: true })
  deadline: Date;

  /**
   * Содержание политики в текстовом формате.
   *
   * @remarks
   * nullable: false.
   */
  @Column({ type: 'text', nullable: false })
  content: string;

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
   * Связь с сущностью 1:M Post.
   */
  @OneToMany(() => Post, (post) => post.policy)
  posts: Post[];

  /**
   * Связь с сущностью 1:M Target.
   */
  @OneToMany(() => Target, (target) => target.policy)
  targets: Target[];

  /**
   * Связь с сущностью 1:M PolicyToPolicyDirectory.
   */
  @OneToMany(
    () => PolicyToPolicyDirectory,
    (policyToPolicyDirectory) => policyToPolicyDirectory.policy,
  )
  policyToPolicyDirectories: PolicyToPolicyDirectory[];

  /**
   * Связь с сущностью M:1 Post.
   * @remarks
   * nullable: false
   */
  @ManyToOne(() => Post, (postCreator) => postCreator.policies, {
    nullable: false,
  })
  postCreator: Post;

  /**
   * Связь с сущностью M:1 Organization.
   */
  @ManyToOne(() => Organization, (organization) => organization.policies)
  organization: Organization;

  /**
   * Связь с сущностью M:1 Account.
   */
  @ManyToOne(() => Account, (account) => account.policies, { nullable: false })
  account: Account;
}
