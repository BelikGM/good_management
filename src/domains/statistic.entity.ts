import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Post } from './post.entity';
import { StatisticData } from './statisticData.entity';
import { Account } from './account.entity';
import { PanelToStatistic } from './panelToStatistic.entity';

/**
 * Перечисление типов проектов.
 */
export enum Type {
  DIRECT = 'Прямая',
  REVERSE = 'Обратная',
}

/**
 * Сущность, представляющая Статистику.
 */
@Entity()
export class Statistic {
  /**
   * Уникальный идентификатор.
   *
   * @remarks
   * Поле автоматически генерируется в формате UUID v4.0.
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Тип статистики.
   *
   * @remarks
   * Используется перечисление `Type`. По умолчанию установлено значение прямая(DIRECT). nullable: false
   */
  @Column({
    type: 'enum',
    enum: Type,
    default: Type.DIRECT,
    nullable: false,
  })
  type: Type;

  /**
   * Название статистики.
   *
   * @remarks
   * nullable: false
   */
  @Column({ type: 'text', nullable: false })
  name: string;

  /**
   * Описание статистики.
   *
   * @remarks
   * nullable: true
   */
  @Column({ type: 'text', nullable: true })
  description: string;

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
   * Связь с сущностью 1:M StatisticData.
   */
  @OneToMany(() => StatisticData, (statisticData) => statisticData.statistic)
  statisticDatas: StatisticData[];

  /**
   * Связь с сущностью 1:M PanelToStatistic.
   */
  @OneToMany(
    () => PanelToStatistic,
    (panelToStatistic) => panelToStatistic.statistic,
  )
  panelToStatistics: PanelToStatistic[];

  /**
   * Связь с сущностью M:1 Post.
   */
  @ManyToOne(() => Post, (post) => post.statistics)
  post: Post;

  /**
   * Связь с сущностью M:1 Account.
   *
   * @remarks
   * nullable: false
   */
  @ManyToOne(() => Account, (account) => account.statistics, {
    nullable: false,
  })
  account: Account;
}
