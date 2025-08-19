import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MessageSeenStatus } from 'src/domains/messageSeenStatus.entity';
import { Logger } from 'winston';
import { MessageSeenStatusRepository } from './repository/messageSeenStatus.repository';
import { MessageSeenStatusCreateDto } from 'src/contracts/messageSeenStatus/create-messageSeenStatus.dto';
import { MessageService } from '../message/message.service';
import { PostReadDto } from 'src/contracts/post/read-post.dto';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class MessageSeenStatusService {
  constructor(
    @InjectRepository(MessageSeenStatus)
    private readonly messageSeenStatusRepository: MessageSeenStatusRepository,
    private readonly messageService: MessageService,
    @InjectRedis()
    private readonly redis: Redis,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async updateSeenStatuses(
    messageIds: string[],
    convertId: string,
    post: PostReadDto,
  ): Promise<void> {
    try {
      const updateDate = new Date();
      const messages = await this.messageService.findBulk(messageIds);
      const messageSeenStatuses = messages.map((message) => {
        const messageSeenStatus: MessageSeenStatusCreateDto = {
          timeSeen: updateDate,
          message: message,
          post: post,
        };
        return messageSeenStatus;
      });
      this.redis.keys(`undefined:messages:${convertId}:*`).then((keys) => {
        const pipeline = this.redis.pipeline();
        pipeline.unlink(keys);
        return pipeline.exec();
      });
      await this.messageSeenStatusRepository.insert(messageSeenStatuses);
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException('Ошибка при прочтении сообщений');
    }
  }
}
