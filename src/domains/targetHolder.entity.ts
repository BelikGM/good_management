import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Target } from './target.entity';
import { Post } from './post.entity';

/**
 * Сущность, представляющая ответственных за задачу.
 */
@Entity()
// @Index(['target', 'post'], { unique: true }) шо то я запутался надо чи нет
export class TargetHolder {
  /**
   * Уникальный идентификатор.
   *
   * @remarks
   * Поле автоматически генерируется в формате UUID v4.0.
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
   * Связь с сущностью М:1 Target.
   *
   * @remarks
   * Установлен индекс, nullable: false
   */
  @ManyToOne(() => Target, (target) => target.targetHolders, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @Index() // Добавляем индекс для поля target
  target: Target;

  /**
   * Связь с сущностью М:1 Post.
   *
   * @remarks
   * Установлен индекс, nullable: false
   */
  @Index() // Добавляем индекс для поля post
  @ManyToOne(() => Post, (post) => post.targetHolders, { nullable: false })
  post: Post;
}
