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
import { RefreshSession } from './refreshSession.entity';
import { Post } from './post.entity';
import { Organization } from './organization.entity';
import { Account } from './account.entity';
import { HistoryUsersToPost } from './historyUsersToPost.entity';

/**
 * Сущность, представляющая Юзера.
 */
@Entity()
export class User {
  /**
   * Уникальный идентификатор.
   *
   * @remarks
   * Поле автоматически генерируется в формате UUID v4.0.
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Имя юзера.
   *
   * @remarks
   * length: 50, nullable: false.
   */
  @Column({ length: 50, nullable: false })
  firstName: string;

  /**
   * Фамилия юзера.
   *
   * @remarks
   * length: 50, nullable: false.
   */
  @Column({ length: 50, nullable: false })
  lastName: string;

  /**
   * Отчество юзера.
   *
   * @remarks
   * length: 50, nullable: false.
   */
  @Column({ length: 50, nullable: true })
  middleName: string;

  /**
   * Id юзера в телеграме.
   *
   * @remarks
   * nullable: true, unique: true.
   */
  @Column({ nullable: true, unique: true })
  telegramId: number;

  /**
   * Номер телефона юзера.
   *
   * @remarks
   * length: 13, nullable: true, unique: true.
   */
  @Column({ length: 13, nullable: true, unique: true })
  telephoneNumber: string;

  /**
   * Ссылка на аватарку из ВК.
   *
   * @remarks
   * nullable: true.
   */
  @Column({ nullable: true })
  avatar_url: string | null;

  /**
   * Id юзера в ВК.
   *
   * @remarks
   * nullable: true, unique: true.
   */
  @Column({ nullable: true, unique: true })
  vk_id: number | null;

  /**
   * Статус уволен ли сотрудник.
   *
   * @remarks
   * nullable: false, default: false .
   */
  @Column({ nullable: false, default: false })
  isFired: boolean;

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
   *
   * @remarks
   * nullable: true
   */
  @OneToMany(() => Post, (post) => post.user, { nullable: true })
  posts: Post[];

  /**
   * Связь с сущностью 1:M RefreshSession.
   */
  @OneToMany(() => RefreshSession, (refreshSession) => refreshSession.user)
  refreshSessions: RefreshSession[];

  /**
   * Связь с сущностью 1:M HistoryUsersToPost.
   */
  @OneToMany(
    () => HistoryUsersToPost,
    (historyUsersToPost) => historyUsersToPost.user,
  )
  historiesUsersToPost: HistoryUsersToPost[];

  /**
   * Связь с сущностью M:1 Organization.
   *
   * @remarks
   * nullable: true (/?????????)
   */
  @ManyToOne(() => Organization, (organization) => organization.users, {
    nullable: true,
  })
  organization: Organization;

  /**
   * Связь с сущностью M:1 Account
   *
   * @remarks
   * Установлен индекс, nullable: true (??????)
   */
  @ManyToOne(() => Account, (account) => account.users, { nullable: true })
  @Index() // Добавляем индекс на поле account
  account: Account;
}
