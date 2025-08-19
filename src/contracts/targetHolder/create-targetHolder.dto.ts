import { Exclude } from 'class-transformer';
import { Post } from 'src/domains/post.entity';
import { Target } from 'src/domains/target.entity';

export class TargetHolderCreateDto {
  @Exclude({ toPlainOnly: true })
  target: Target;

  @Exclude({ toPlainOnly: true })
  post: Post;
}
