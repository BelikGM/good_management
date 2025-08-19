import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  Index,
} from 'typeorm';
import { Strategy } from './strategy.entity';
import { Account } from './account.entity';

/**
 * Сущность Objective (Краткосрочная цель).
 *
 * Представляет краткосрочную цель.
 */
@Entity()
export class Objective {
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
   * Описание ситуации.
   *
   * @remarks
   * Поле представляет массив текстовых значений, описывающих текущую ситуацию. nullable: true.
   *
   * @example
   * ['Рост затрат', 'Недостаток ресурсов']
   */
  @Column({ type: 'text', array: true, nullable: true })
  situation: string[];

  /**
   * Содержание цели.
   *
   * @remarks
   * Поле представляет массив текстовых значений, описывающих содержание и шаги для достижения цели. nullable: true.
   *
   * @example
   * ['Разработка нового продукта', 'Оптимизация процессов']
   */
  @Column({ type: 'text', array: true, nullable: true })
  content: string[];

  /**
   * Коренная причина краткосрочной цели.
   *
   * @remarks
   * Поле представляет массив текстовых значений, описывающих коренные причины проблемы, на которую нацелена цель. nullable: true.
   *
   * @example
   * ['Недостаток обучения сотрудников', 'Сложности в цепочке поставок']
   */
  @Column({ type: 'text', array: true, nullable: true })
  rootCause: string[];

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
   * Связь с сущностью 1:1 Strategy.
   *
   * @remarks
   * Поле связывает цель с конкретной стратегией.
   * Добавлен индекс для ускорения поиска по полю `strategy`.
   * nullable: false
   */
  @OneToOne(() => Strategy, (strategy) => strategy.objective, {
    nullable: false,
  })
  @JoinColumn()
  @Index() // Добавляем индекс на поле strategy
  strategy: Strategy;

  /**
   * Связь с сущностью M:1 Account.
   * @remarks
   * nullable: false
   */
  @ManyToOne(() => Account, (account) => account.objectives, {
    nullable: false,
  })
  account: Account;
}
