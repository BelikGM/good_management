import {
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Attachment } from './attachment.entity';
import { Message } from './message.entity';

@Entity()
export class AttachmentToMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(
    () => Attachment,
    (attachment) => attachment.attachmentToMessages,
    { onDelete: 'CASCADE' },
  )
  @Index()
  attachment: Attachment;

  @ManyToOne(() => Message, (message) => message.attachmentToMessages, {
    onDelete: 'CASCADE',
  })
  @Index()
  message: Message;
}
