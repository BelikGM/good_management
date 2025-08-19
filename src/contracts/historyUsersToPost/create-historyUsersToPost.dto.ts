import { Exclude } from 'class-transformer';
import { Post } from 'src/domains/post.entity';
import { User } from 'src/domains/user.entity';

export class HistoryUsersToPostCreateDto {
  @Exclude({ toPlainOnly: true })
  user: User;

  @Exclude({ toPlainOnly: true })
  post: Post;
}
