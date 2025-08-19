import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Organization } from './organization.entity';
import { Account } from './account.entity';
import { Post } from './post.entity';

/**
 * Сущность цели.
 * Представляет цель для организации.
 */
@Entity()
export class Goal {
  /**
   * Уникальный идентификатор цели.
   *
   * @remarks
   * Поле автоматически генерируется в формате UUID v4.0.
   *
   * @example
   * '123e4567-e89b-12d3-a456-426614174000'
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Содержимое цели.
   *
   * @remarks
   * Хранит массив текстов, описывающих цель. Всегда size = 2.
   *
   * @example
   * ['Увеличить прибыль', 'Сократить расходы']
   */
  @Column({ type: 'text', array: true, nullable: false })
  content: string[];

  /**
   * Дата создания цели.
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
   * Дата последнего обновления цели.
   *
   * @remarks
   * Поле автоматически обновляется при изменении записи.
   */
  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  /**
   * Связь с сущностью M:1 Post.
   * @remarks
   * nullable: false.
   */
  @ManyToOne(() => Post, (postCreator) => postCreator.goals, {
    nullable: false,
  })
  postCreator: Post;

  /**
   * Связь с сущностью M:1 Account.
   * @remarks
   * nullable: false.
   */
  @ManyToOne(() => Account, (account) => account.goals, { nullable: false })
  account: Account;

  /**
   * Связь с сущностью 1:1 Organization.
   */
  @OneToOne(() => Organization, (organization) => organization.goal)
  @JoinColumn()
  @Index() // Добавляем индекс на поле organization
  organization: Organization;
}
