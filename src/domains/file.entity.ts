import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Сущность File.
 * Представляет загруженные файлы
 */
@Entity()
export class File {
  /**
   * Уникальный идентификатор файла.
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
   * nullable: false
   *
   * @example
   * 'photo.jpg'
   */
  @Column({ nullable: false, length: 255 })
  fileName: string;

  /**
   * Путь к файлу.
   *
   * @remarks
   * nullable: false, на проде добавляется префикс
   *
   * @example
   * 'uploads/image.jpg'
   */
  @Column({ nullable: false })
  path: string;

  /**
   * Размер файла в байтах.
   *
   * @remarks
   * nullable: false.
   *
   * @example
   * 204800
   */
  @Column({ nullable: false })
  size: number;

  /**
   * MIME-тип файла.
   *
   * @remarks
   * nullable: false, разрешены jpeg, jpg, png, gif
   *
   * @example
   * 'image/jpg'
   */
  @Column({ nullable: false })
  mimetype: string;

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
}
