import { Post } from 'src/domains/post.entity';
import { User } from 'src/domains/user.entity';

export class HistoryUsersToPostReadDto {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  post: Post;
}
