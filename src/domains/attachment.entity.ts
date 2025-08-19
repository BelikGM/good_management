import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { AttachmentToTarget } from './attachmentToTarget.entity';
import { AttachmentToMessage } from './attachmentToMessage.entity';

/**
 * Сущность Attachment.
 * Представляет вложенные файлы сообщения или задачи
 */
@Entity()
export class Attachment {
  /**
   * Уникальный идентификатор вложения.
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
   * Имя вложения.
   *
   * @remarks
   * nullable: false
   *
   * @example
   * 'photo.jpg'
   */
  @Column({ nullable: false, length: 255 })
  attachmentName: string;

  /**
   * Путь к вложению.
   *
   * @remarks
   * nullable: false, на проде добавляется префикс
   *
   * @example
   * 'uploads/documents/document.pdf'
   */
  @Column({ nullable: false })
  attachmentPath: string;

  /**
   * Размер вложения в байтах.
   *
   * @remarks
   * nullable: false.
   *
   * @example
   * 204800
   */
  @Column({ nullable: false })
  attachmentSize: number;

  /**
   * MIME-тип вложения.
   *
   * @remarks
   * nullable: false, разрешены jpeg, jpg, png, gif, pdf, docx, mp4, webm, mp3, wav
   *
   * @example
   * 'image/jpg'
   */
  @Column({ nullable: false })
  attachmentMimetype: string;

  /**
   * Хеш файла.
   *
   * @remarks
   * для кеширования в redis (а уже и хуй знает зачем)
   *
   * @example
   * 'image/jpg'
   */
  @Column({ nullable: false })
  hash: string;

  /**
   * Оригинальное имя файла.
   *
   * @remarks
   * nullable: false
   *
   * @example
   * 'originalName.jpg'
   */
  @Column({ nullable: false, default: 'OriginalName' })
  originalName: string;

  /**
   * Дата создания записи.
   *
   * @remarks
   * Поле автоматически заполняется при создании вложения.
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
   * Поле автоматически обновляется при изменении данных вложения.
   */
  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  /**
   * Связь с вложениями задачи (1:M AttachmentToTarget).
   */
  @OneToMany(
    () => AttachmentToTarget,
    (attachmentToTarget) => attachmentToTarget.attachment,
  )
  attachmentToTargets: AttachmentToTarget[];

  /**
   * Связь с вложениями сообщения (1:M AttachmentToMessage).
   */
  @OneToMany(
    () => AttachmentToMessage,
    (attachmentToMessage) => attachmentToMessage.attachment,
  )
  attachmentToMessages: AttachmentToMessage[];
}
