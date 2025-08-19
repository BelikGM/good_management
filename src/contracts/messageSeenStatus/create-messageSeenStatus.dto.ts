import { Exclude } from 'class-transformer';
import { Message } from 'src/domains/message.entity';
import { Post } from 'src/domains/post.entity';

export class MessageSeenStatusCreateDto {
  @Exclude({ toPlainOnly: true })
  timeSeen: Date;

  @Exclude({ toPlainOnly: true })
  message: Message;

  @Exclude({ toPlainOnly: true })
  post: Post;
}
