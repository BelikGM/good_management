import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Convert } from './convert.entity';
import { Post } from './post.entity';

@Entity()
export class WatchersToConvert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * Количество непрочитанных сообщений для данного наблюдателя.
   */
  @Column({ type: 'int', default: 0 })
  unreadMessagesCount: number;

  /**
   * Номер последнего прочитанного сообщения.
   */
  @Column({ type: 'int', default: 0 })
  lastSeenNumber: number;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(() => Convert, (convert) => convert.watchersToConvert, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  convert: Convert;

  @ManyToOne(() => Post, { nullable: false, onDelete: 'CASCADE' })
  post: Post;
}
