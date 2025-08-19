import {
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Policy } from './policy.entity';
import { PolicyDirectory } from './policyDirectory.entity';

/**
 * Сущность, представляющая связующую между политиками и папкой с политиками (решает ситуацию с M:M).
 */
@Entity()
export class PolicyToPolicyDirectory {
  /**
   * Уникальный идентификатор.
   *
   * @remarks
   * Поле автоматически генерируется в формате UUID v4.0.
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
   *
   * @example
   * '2024-06-01T12:34:56Z'
   */
  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  /**
   * Связь с сущностью М:1 Policy.
   *
   * @remarks
   * Установлен индекс
   */
  @ManyToOne(() => Policy, (policy) => policy.policyToPolicyDirectories)
  @Index() // Добавляем индекс для поля policy
  policy: Policy;

  /**
   * Связь с сущностью М:1 PolicyDirectory.
   */
  @ManyToOne(
    () => PolicyDirectory,
    (policyDirectory) => policyDirectory.policyToPolicyDirectories,
    { onDelete: 'CASCADE' },
  )
  policyDirectory: PolicyDirectory;
}
