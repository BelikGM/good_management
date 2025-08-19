import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ControlPanel } from './controlPanel.entity';
import { Statistic } from './statistic.entity';

/**
 * Сущность, представляющая связующую между политиками и папкой с политиками (решает ситуацию с M:M).
 */
@Entity()
export class PanelToStatistic {
  /**
   * Уникальный идентификатор.
   *
   * @remarks
   * Поле автоматически генерируется в формате UUID v4.0.
   */
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  /**
   * Порядковый номер статистики в панеле.
   *
   * @remarks
   * nullable: true
   */
  @Column({ nullable: true, default: 1 })
  orderStatisticNumber: number;

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
   * Связь с сущностью М:1 ControlPanel.
   *
   * @remarks
   * Установлен индекс
   */
  @ManyToOne(
    () => ControlPanel,
    (controlPanel) => controlPanel.panelToStatistics,
    { nullable: false, onDelete: 'CASCADE' },
  )
  @Index() // Добавляем индекс
  controlPanel: ControlPanel;

  /**
   * Связь с сущностью М:1 Statistic.
   */
  @ManyToOne(() => Statistic, (statistic) => statistic.panelToStatistics, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  statistic: Statistic;
}
