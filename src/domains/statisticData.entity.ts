import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Statistic } from './statistic.entity';

/**
 * Перечисление типов проектов.
 */
export enum CorrelationType {
  MONTH = 'Месяц',
  YEAR = 'Год',
  WEEK = 'Неделя',
}

/**
 * Сущность, представляющая Данные статистики (точки статистики).
 */
@Entity()
export class StatisticData {
  /**
   * Уникальный идентификатор.
   *
   * @remarks
   * Поле автоматически генерируется в формате UUID v4.0.
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Значение точки.
   *
   * @remarks
   * nullable: false.
   */
  @Column({ type: 'decimal', nullable: false })
  value: number;

  /**
   * Дата точки.
   *
   * @remarks
   * default: CURRENT_TIMESTAMP, nullable: false.
   */
  @Column({
    type: 'timestamp',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  valueDate: Date;

  /**
   * Флаг обозначающий корреляционное ли значение.
   *
   * @remarks
   * default: false, nullable: false.
   */
  @Column({
    type: 'enum',
    enum: CorrelationType,
    nullable: true,
  })
  correlationType: CorrelationType;

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
   * Связь с сущностью M:1 Statistic.
   */
  @ManyToOne(() => Statistic, (statistic) => statistic.statisticDatas, {
    eager: false,
  })
  statistic: Statistic;
}
