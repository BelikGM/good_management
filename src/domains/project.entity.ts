import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Target } from './target.entity';
import { Strategy } from './strategy.entity';
import { Account } from './account.entity';
import { Organization } from './organization.entity';
import { Post } from './post.entity';

/**
 * Перечисление типов проектов.
 */
export enum Type {
  PROJECT = 'Проект',
  PROGRAM = 'Программа',
}

/**
 * Сущность, представляющая проект.
 */
@Entity()
export class Project {
  /**
   * Уникальный идентификатор.
   *
   * @remarks
   * Поле автоматически генерируется в формате UUID v4.0.
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Порядковый номер проекта.
   *
   * @remarks
   * Инркемент в БД.
   */
  @Column({ nullable: false })
  projectNumber: number;

  /**
   * Название проекта.
   *
   * @remarks
   * Длина <= 50, default: "Проект", nullable: false.
   */
  @Column({ length: 50, default: 'Проект', nullable: false })
  projectName: string;

  /**
   * Id программы.
   *
   * @remarks
   * UUID v4.0, nullable: true.
   */
  @Column({ type: 'uuid', nullable: true })
  programId: string;

  /**
   * Содержание проекта.
   *
   * @remarks
   * nullable: true.
   */
  @Column({ type: 'text', nullable: true })
  content: string;

  /**
   * Тип проекта.
   *
   * @remarks
   * Используется перечисление `Type`. По умолчанию установлено значение проект(PROJECT). nullable: false
   */
  @Column({
    type: 'enum',
    enum: Type,
    default: Type.PROJECT,
    nullable: false,
  })
  type: Type;

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
   * Связь с сущностью M:1 Organization.
   */
  @ManyToOne(() => Organization, (organization) => organization.projects)
  organization: Organization;

  /**
   * Связь с сущностью 1:M Target.
   */
  @OneToMany(() => Target, (target) => target.project)
  targets: Target[];

  /**
   * Связь с сущностью M:1 Strategy.
   *
   * @remarks
   * Установлен индекс, nullable: true
   */
  @ManyToOne(() => Strategy, (strategy) => strategy.projects, {
    nullable: true,
  })
  @Index() // Добавляем индекс для поля strategy
  strategy: Strategy;

  /**
   * Связь с сущностью M:1 Account.
   *
   * @remarks
   * nullable: false
   */
  @ManyToOne(() => Account, (account) => account.projects, { nullable: false })
  account: Account;

  /**
   * Связь с сущностью M:1 Post.
   *
   * @remarks
   * nullable: false
   */
  @ManyToOne(() => Post, (postCreator) => postCreator.projects, {
    nullable: false,
  })
  postCreator: Post;
}

// добавить state
