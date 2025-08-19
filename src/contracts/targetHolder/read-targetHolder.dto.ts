import { Post } from 'src/domains/post.entity';
import { Target } from 'src/domains/target.entity';

export class TargetHolderReadDto {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  target: Target;
  post: Post;
}
