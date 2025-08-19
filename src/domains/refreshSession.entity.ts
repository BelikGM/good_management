import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

/**
 * Сущность, представляющая сессию юзера.
 */
@Entity()
export class RefreshSession {
  /**
   * Уникальный идентификатор.
   *
   * @remarks
   * Поле автоматически генерируется в формате UUID v4.0.
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Хедер User_agent от клиента.
   *
   * @remarks
   * length: 200, nullable: false
   */
  @Column({ length: 200, nullable: false })
  user_agent: string;

  /**
   * Уникальный идентификатор устройства от клиента.
   *
   * @remarks
   * length: 200, nullable: false
   */
  @Column({ length: 200, nullable: false })
  fingerprint: string;

  /**
   * IP клиента.
   *
   * @remarks
   * nullable: false
   */
  @Column({ nullable: false })
  ip: string;

  /**
   * Время сгорания сессии (вроде в мс).
   *
   * @remarks
   * nullable: false
   */
  @Column({ nullable: false })
  expiresIn: number;

  /**
   * JWT токен сессии.
   *
   * @remarks
   * nullable: false
   */
  @Column({ nullable: false })
  refreshToken: string;

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
   * Связь с сущностью M:1 User.
   */
  @ManyToOne(() => User, (user) => user.refreshSessions)
  user: User;
}
