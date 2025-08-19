import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from 'winston';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { WatchersToConvert } from 'src/domains/watchersToConvert.entity';
import { WatchersToConvertRepository } from './repository/watchersToConvert.repository';
import { Convert } from 'src/domains/convert.entity';
import { PostService } from '../post/post.service';
import { PostReadDto } from 'src/contracts/post/read-post.dto';
import { ConvertReadDto } from 'src/contracts/convert/read-convert.dto';
import { DataSource } from 'typeorm';
@Injectable()
export class WatchersToConvertService {
  constructor(
    @InjectRepository(WatchersToConvert)
    private readonly watchersToConvertRepository: WatchersToConvertRepository,
    private readonly postService: PostService,
    @InjectRedis()
    private readonly redis: Redis,
    @Inject('winston') private readonly logger: Logger,
    private dataSource: DataSource,
  ) {}

  async updateSeenStatuses(
    lastSeenMessageNumber: number,
    messagesCount: number,
    convertId: string,
    post: PostReadDto,
  ): Promise<void> {
    try {
      await this.dataSource.transaction(async (transactionalEntityManager) => {
        const watcherToConvert = await transactionalEntityManager.findOne(
          WatchersToConvert,
          {
            where: {
              post: { id: post.id },
              convert: { id: convertId },
            },
            lock: { mode: 'pessimistic_write' },
          },
        );

        const unreadMessageCount =
          watcherToConvert.unreadMessagesCount - messagesCount;

        if (unreadMessageCount < 0) {
          throw new BadRequestException('Костыль в попе');
        }

        await transactionalEntityManager.update(
          WatchersToConvert,
          watcherToConvert.id,
          {
            lastSeenNumber: lastSeenMessageNumber,
            unreadMessagesCount: unreadMessageCount,
          },
        );
      });
    } catch (err) {
      this.logger.error(err);
      if (err instanceof BadRequestException) {
        throw err;
      }
      throw new InternalServerErrorException(
        'Ошибка при прочтении сообщений наблюдателем',
      );
    }
  }

  async updateWatchersCount(watcherIds: string[]): Promise<void> {
    try {
      // await this.watchersToConvertRepository.increment(watcherIds, 'unreadMessagesCount', 1 );
      await this.watchersToConvertRepository
        .createQueryBuilder()
        .update()
        .set({ unreadMessagesCount: () => 'unreadMessagesCount + 1' })
        .where('id IN (:...watcherIds)', { watcherIds })
        .execute();
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при обновлении счетчика непрочитанных сообщений для наблюдателя',
      );
    }
  }

  async createSeveral(
    convert: Convert,
    postIds: string[],
    messageCount: number,
  ): Promise<void> {
    try {
      const posts = await this.postService.findBulk(postIds);

      const watchersToConvert = posts.map((post) => {
        const watcherToConvert = new WatchersToConvert();
        watcherToConvert.post = post;
        watcherToConvert.convert = convert;
        watcherToConvert.unreadMessagesCount = messageCount;
        return watcherToConvert;
      });

      await this.watchersToConvertRepository.insert(watchersToConvert);
    } catch (err) {
      this.logger.error(err);

      throw new InternalServerErrorException(
        'Ой, что - то пошло не так при добавлении наблюдателей к конверту!',
      );
    }
  }

  async remove(convert: ConvertReadDto): Promise<void> {
    try {
      await this.watchersToConvertRepository.delete({ convert: convert });
    } catch (err) {
      this.logger.error(err);

      throw new InternalServerErrorException(
        'Ой, что - то пошло не так при удалении наблюдателей конверта!',
      );
    }
  }
}
