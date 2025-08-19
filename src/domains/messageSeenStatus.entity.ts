import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Message } from './message.entity';
import { Post } from './post.entity';

@Entity()
export class MessageSeenStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  timeSeen: Date;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(() => Message, (message) => message.seenStatuses, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  message: Message;

  @ManyToOne(() => Post, { nullable: false, onDelete: 'CASCADE' })
  post: Post;
}
