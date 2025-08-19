import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Convert } from './convert.entity';
import { Post } from './post.entity';
import { AttachmentToMessage } from './attachmentToMessage.entity';
import { MessageSeenStatus } from './messageSeenStatus.entity';

@Entity()
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: false })
  content: string;

  /**
   * Порядковый номер сообщения в конверте.
   *
   * @remarks
   * Инркемент в БД.
   */
  @Column({ nullable: false })
  messageNumber: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(() => Convert, (convert) => convert.messages, { nullable: false })
  convert: Convert;

  @ManyToOne(() => Post, (post) => post.messages, { nullable: false })
  sender: Post;

  /**
   * Связь с вложениями сообщения (1:M AttachmentToMessage).
   */
  @OneToMany(
    () => AttachmentToMessage,
    (attachmentToMessage) => attachmentToMessage.message,
  )
  attachmentToMessages: AttachmentToMessage[];

  @OneToMany(() => MessageSeenStatus, (seenStatus) => seenStatus.message)
  seenStatuses: MessageSeenStatus[];
}
