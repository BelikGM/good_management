import { AttachmentToMessage } from 'src/domains/attachmentToMessage.entity';
import { Convert } from 'src/domains/convert.entity';
import { MessageSeenStatus } from 'src/domains/messageSeenStatus.entity';
import { Post } from 'src/domains/post.entity';

export class MessageReadDto {
  id: string;

  content: string;

  messageNumber: number;

  createdAt: Date;

  updatedAt: Date;

  convert: Convert;

  sender: Post;

  attachmentToMessages: AttachmentToMessage[];

  seenStatuses: MessageSeenStatus[];
}
