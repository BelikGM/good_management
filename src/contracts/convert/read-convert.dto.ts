import { Account } from 'src/domains/account.entity';
import { PathConvert, TypeConvert } from 'src/domains/convert.entity';
import { ConvertToPost } from 'src/domains/convertToPost.entity';
import { Message } from 'src/domains/message.entity';
import { Post } from 'src/domains/post.entity';
import { Target } from 'src/domains/target.entity';
import { WatchersToConvert } from 'src/domains/watchersToConvert.entity';

export class ConvertReadDto {
  id: string;
  convertTheme: string;
  pathOfPosts: string[];
  convertType: TypeConvert;
  convertPath: PathConvert;
  convertStatus: boolean;
  activePostId: string;
  dateStart: Date;
  deadline: Date;
  dateFinish: Date;
  createdAt: Date;
  messages: Message[];
  convertToPosts: ConvertToPost[];
  host: Post;
  account: Account;
  target: Target;
  watchersToConvert: WatchersToConvert[];
}
