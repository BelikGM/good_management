import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { TargetHolder } from './targetHolder.entity';
import { Project } from './project.entity';
import { Policy } from './policy.entity';
import { AttachmentToTarget } from './attachmentToTarget.entity';
import { Convert } from './convert.entity';

/**
 * Перечисление типов задач.
 */
export enum Type {
  COMMON = 'Задача',
  STATISTIC = 'Метрика',
  RULE = 'Правила',
  PRODUCT = 'Продукт',
  EVENT = 'Организационные мероприятия',
  ORDER = 'Приказ',
  PERSONAL = 'Личная',
}

/**
 * Перечисление состояний задач.
 */
export enum State {
  DRAFT = 'Черновик',
  ACTIVE = 'Активная',
  REJECTED = 'Отменена',
  FINISHED = 'Завершена',
}

/**
 * Сущность, представляющая Задачу.
 */
@Entity()
export class Target {
  /**
   * Уникальный идентификатор.
   *
   * @remarks
   * Поле автоматически генерируется в формате UUID v4.0.
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Тип задачи.
   *
   * @remarks
   * Используется перечисление `Type`. По умолчанию установлено значение обычная(COMMON). nullable: false
   */
  @Column({
    type: 'enum',
    enum: Type,
    default: Type.COMMON,
    nullable: false,
  })
  type: Type;

  /**
   * Порядковый номер задачи в проекте.
   *
   * @remarks
   * nullable: false.
   */
  @Column({ nullable: false })
  orderNumber: number;

  /**
   * Содержание задачи.
   *
   * @remarks
   * nullable: false.
   */
  @Column({ type: 'text', nullable: false })
  content: string;

  /**
   * Id текущего ответственного поста за задачу.
   *
   * @remarks
   * UUID v4.0, nullable: false.
   */
  @Column({ type: 'uuid', nullable: true })
  holderPostId: string;

  /**
   * Состояние задачи.
   *
   * @remarks
   * Используется перечисление `State`. По умолчанию установлено значение активная(ACTIVE). nullable: false
   */
  @Column({
    type: 'enum',
    enum: State,
    default: State.DRAFT,
    nullable: false,
  })
  targetState: State;

  /**
   * Дата старта задачи.
   *
   * @remarks
   * nullable: true
   */
  @Column({
    type: 'timestamp',
    nullable: true,
  })
  dateStart: Date;

  /**
   * Дедлайн задачи.
   *
   * @remarks
   * nullable: true
   */
  @Column({ type: 'timestamp', nullable: true })
  deadline: Date;

  /**
   * Дата окончания задачи.
   *
   * @remarks
   * nullable: true
   */
  @Column({ type: 'timestamp', nullable: true })
  dateComplete: Date;

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
   * Связь с сущностью 1:1 Convert.
   */
  @OneToOne(() => Convert, (convert) => convert.target, { nullable: true })
  @JoinColumn()
  convert: Convert;

  /**
   * Связь с сущностью M:1 Project.
   *
   * @remarks
   * Установлен индекс, nullable: true
   */
  @ManyToOne(() => Project, (project) => project.targets, { nullable: true })
  @Index() // Добавляем индекс для поля project
  project: Project;

  /**
   * Связь с сущностью M:1 Policy.
   *
   * @remarks
   * Установлен индекс, nullable: true
   */
  @ManyToOne(() => Policy, (policy) => policy.targets, { nullable: true })
  @Index() // Добавляем индекс для поля policy
  policy: Policy;

  /**
   * Связь с сущностью 1:M TargetHolder.
   */
  @OneToMany(() => TargetHolder, (targetHolder) => targetHolder.target)
  targetHolders: TargetHolder[];

  /**
   * Связь с сущностью 1:M AttachmentToTarget.
   */
  @OneToMany(
    () => AttachmentToTarget,
    (attachmentToTarget) => attachmentToTarget.target,
  )
  attachmentToTargets: AttachmentToTarget[];
}
