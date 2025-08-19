import {
  CreateDateColumn,
  Entity,
  Index,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Group } from './group.entity';
import { Post } from './post.entity';

@Entity()
export class GroupToPost {
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(() => Post, (post) => post.groupToPosts)
  @Index() // Добавляем индекс для поля user
  post: Post;

  @ManyToOne(() => Group, (group) => group.groupToPosts)
  @Index() // Добавляем индекс для поля group
  group: Group;
}
