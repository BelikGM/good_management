import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PolicyToPolicyDirectory } from './policyToPolicyDirectories.entity';
import { Account } from './account.entity';

/**
 * Сущность, представляющая папку с политиками.
 */
@Entity()
export class PolicyDirectory {
  /**
   * Уникальный идентификатор папки с политиками.
   *
   * @remarks
   * Поле автоматически генерируется в формате UUID v4.0.
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Название папки.
   *
   * @remarks
   * nullable: false.
   */
  @Column({ nullable: false })
  directoryName: string;

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
   * Связь с сущностью 1:М PolicyToPolicyDirectory.
   */
  @OneToMany(
    () => PolicyToPolicyDirectory,
    (policyToPolicyDirectory) => policyToPolicyDirectory.policyDirectory,
  )
  policyToPolicyDirectories: PolicyToPolicyDirectory[];

  /**
   * Связь с сущностью М:1 Account.
   *
   * @remarks
   * nullable: false
   */
  @ManyToOne(() => Account, (account) => account.policies, { nullable: false })
  account: Account;
}
