import {
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from './post.entity';
import { User } from './user.entity';

/**
 * Сущность HistoryUsersToPost.
 *
 * Хранит историю привязки пользователей к постам (должностям) для аудита и анализа изменений.
 */
@Entity()
export class HistoryUsersToPost {
  /**
   * Уникальный идентификатор записи.
   *
   * @remarks
   * Поле автоматически генерируется в формате UUID v4.0.
   *
   * @example
   * '123e4567-e89b-12d3-a456-426614174000'
   */
  @PrimaryGeneratedColumn('uuid')
  public id: string;

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
   */
  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  /**
   * Связь с сущностью M:1 Post (должность).
   *
   * @remarks
   * Поле связывает запись истории с конкретной должностью.
   * Добавлен индекс для ускорения поиска по полю `post`.
   */
  @ManyToOne(() => Post, (post) => post.historiesUsersToPost, {
    onDelete: 'CASCADE',
  })
  @Index() // Добавляем индекс для поля policy
  post: Post;

  /**
   * Связь с сущностью M:1 User.
   *
   * @remarks
   * Поле связывает запись истории с конкретным пользователем.
   */
  @ManyToOne(() => User, (user) => user.historiesUsersToPost, {
    onDelete: 'CASCADE',
  })
  user: User;
}
