import {
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Attachment } from './attachment.entity';
import { Target } from './target.entity';

@Entity()
export class AttachmentToTarget {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(() => Attachment, (attachment) => attachment.attachmentToTargets, {
    onDelete: 'CASCADE',
  })
  @Index()
  attachment: Attachment;

  @ManyToOne(() => Target, (target) => target.attachmentToTargets, {
    onDelete: 'CASCADE',
  })
  @Index()
  target: Target;
}
