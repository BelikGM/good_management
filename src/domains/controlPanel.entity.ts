import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { PanelToStatistic } from './panelToStatistic.entity';
import { Organization } from './organization.entity';
import { Post } from './post.entity';

/**
 * Перечисление типов панели.
 */
export enum PanelType {
  GLOBAL = 'Глобальная',
  LOCAL = 'Личная',
}

/**
 * Сущность File.
 * Представляет загруженные файлы
 */
@Entity()
export class ControlPanel {
  /**
   * Уникальный идентификатор.
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
   * Имя файла.
   *
   * @remarks
   * default: 'Панель №', nullable: false, length: 255
   *
   * @example
   * 'photo.jpg'
   */
  @Column({ default: 'Панель №', nullable: false, length: 255 })
  panelName: string;

  /**
   * Порядковый номер панели.
   *
   * @remarks
   * nullable: false.
   */
  @Column({ nullable: false })
  orderNumber: number;

  /**
   * Номер панели в БД относительно поста.
   *
   * @remarks
   * nullable: false. Инркемент в БД относительно поста.
   */
  @Column({ nullable: false })
  controlPanelNumber: number;

  /**
   * Тип панели.
   *
   * @remarks
   * Используется перечисление `PanelType`. По умолчанию установлено значение глобальная(GLOBAL). nullable: false
   */
  @Column({
    type: 'enum',
    enum: PanelType,
    default: PanelType.LOCAL,
    nullable: false,
  })
  panelType: PanelType;


  /**
   * Флаг для фронта.
   *
   * @remarks
   * default: false, nullable: false
   */
  @Column({ default: false, nullable: false })
  isNameChanged: boolean;

  /**
   * Дата создания записи.
   *
   * @remarks
   * Поле автоматически заполняется при создании файла.
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
   * Поле автоматически обновляется при изменении данных файла.
   */
  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  /**
   * Связь с сущностью 1:M PanelToStatistic.
   */
  @OneToMany(
    () => PanelToStatistic,
    (panelToStatistic) => panelToStatistic.controlPanel,
  )
  panelToStatistics: PanelToStatistic[];

  /**
   * Связь с сущностью M:1 Organization.
   */
  @ManyToOne(() => Organization, (organization) => organization.controlPanels)
  organization: Organization;

  /**
   * Связь с сущностью M:1 Post.
   */
  @ManyToOne(() => Post, (post) => post.controlPanels)
  post: Post;
}
