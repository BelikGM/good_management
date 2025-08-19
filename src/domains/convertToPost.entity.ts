import {
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Convert } from './convert.entity';
import { Post } from './post.entity';

export enum UserType {
  WATCHER = 'Наблюдатель',
  RECIEVER = 'Получатель',
}

@Unique(['post', 'convert'])
@Entity()
export class ConvertToPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(() => Post, (post) => post.convertToPosts)
  post: Post;

  @ManyToOne(() => Convert, (convert) => convert.convertToPosts)
  convert: Convert;
}
