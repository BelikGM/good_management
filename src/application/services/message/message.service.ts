import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from 'winston';
import { MessageRepository } from './repository/message.repository';
import { Message } from 'src/domains/message.entity';
import { MessageReadDto } from 'src/contracts/message/read-message.dto';
import { MessageCreateDto } from 'src/contracts/message/create-message.dto';
import { MessageUpdateDto } from 'src/contracts/message/update-message.dto';
import { AttachmentToMessageService } from '../attachmentToMessage/attachmentToMessage.service';
import { Brackets, In } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: MessageRepository,
    private readonly attachmentToMessageService: AttachmentToMessageService,
    @InjectRedis()
    private readonly redis: Redis,
    @Inject(CACHE_MANAGER)
    private readonly cacheService: Cache,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async findSeenForWatcherForConvert(
    convertId: string,
    pagination: number,
    userPostIds: string[],
  ): Promise<MessageReadDto[]> {
    try {
      // const cachedMessages = await this.cacheService.get<Message[]>(`messages:${convertId}:${pagination}:seen:watcher`)
      const messages = await this.messageRepository
        .createQueryBuilder('message')
        .leftJoinAndSelect(
          'message.attachmentToMessages',
          'attachmentToMessages',
        )
        .leftJoinAndSelect('attachmentToMessages.attachment', 'attachment')
        .leftJoinAndSelect('message.sender', 'sender')
        .leftJoinAndSelect('sender.user', 'user')
        .leftJoin('message.convert', 'convert')
        .leftJoin('convert.watchersToConvert', 'watchersToConvert')
        .where('message.convertId = :convertId', { convertId })
        .andWhere('watchersToConvert.postId IN (:...userPostIds)', {
          userPostIds,
        })
        .andWhere('message.messageNumber <= watchersToConvert.lastSeenNumber')
        .orderBy('message.createdAt', 'DESC')
        .take(30)
        .skip(pagination)
        .getMany();

      // if (!cachedMessages && messages.length !== 0) {
      //   await this.cacheService.set<Message[]>(`messages:${convertId}:${pagination}:seen:watcher`, messages, 1860000);
      // }

      return messages.map((message) => ({
        id: message.id,
        content: message.content,
        messageNumber: message.messageNumber,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        convert: message.convert,
        sender: message.sender,
        attachmentToMessages: message.attachmentToMessages,
        seenStatuses: message.seenStatuses,
      }));
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при получении прочитанных сообщений в конверте',
      );
    }
  }

  async findUnseenForWatcherForConvert(
    convertId: string,
    userPostIds: string[],
  ): Promise<MessageReadDto[]> {
    try {
      // const cachedMessages = await this.cacheService.get<Message[]>(`messages:${convertId}:unseen:watcher`)
      const messages = await this.messageRepository
        .createQueryBuilder('message')
        .leftJoinAndSelect(
          'message.attachmentToMessages',
          'attachmentToMessages',
        )
        .leftJoinAndSelect('attachmentToMessages.attachment', 'attachment')
        .leftJoinAndSelect('message.sender', 'sender')
        .leftJoinAndSelect('sender.user', 'user')
        .leftJoin('message.convert', 'convert')
        .leftJoin('convert.watchersToConvert', 'watchersToConvert')
        .where('message.convertId = :convertId', { convertId })
        .andWhere('watchersToConvert.postId IN (:...userPostIds)', {
          userPostIds,
        })
        .andWhere('message.messageNumber > watchersToConvert.lastSeenNumber')
        .orderBy('message.createdAt', 'DESC')
        .getMany();

      // if (!cachedMessages && messages.length !== 0) {
      //   await this.cacheService.set<Message[]>(`messages:${convertId}:unseen:watcher`, messages, 1860000);
      // }

      return messages.map((message) => ({
        id: message.id,
        content: message.content,
        messageNumber: message.messageNumber,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        convert: message.convert,
        sender: message.sender,
        attachmentToMessages: message.attachmentToMessages,
        seenStatuses: message.seenStatuses,
      }));
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при получении прочитанных сообщений в конверте',
      );
    }
  }

  async findSeenForConvert(
    convertId: string,
    pagination: number,
    userPostIds: string[],
  ): Promise<MessageReadDto[]> {
    try {
      const cachedMessages = await this.cacheService.get<Message[]>(
        `messages:${convertId}:${pagination}:seen`,
      );
      const messages =
        cachedMessages ??
        (await this.messageRepository
          .createQueryBuilder('message')
          .leftJoinAndSelect(
            'message.attachmentToMessages',
            'attachmentToMessages',
          )
          .leftJoinAndSelect('attachmentToMessages.attachment', 'attachment')
          .leftJoinAndSelect('message.seenStatuses', 'seenStatus')
          .leftJoinAndSelect('seenStatus.post', 'post')
          .leftJoinAndSelect('post.user', 'reader')
          .leftJoinAndSelect('message.sender', 'sender')
          .leftJoinAndSelect('sender.user', 'user')
          .where('message.convertId = :convertId', { convertId })
          .andWhere(
            new Brackets((qb) => {
              qb.where('post.id IN (:...userPostIds)', { userPostIds }) // Сообщение прочитано текущим пользователем
                .orWhere('sender.id IN (:...userPostIds)', { userPostIds }); // Сообщение отправлено текущим пользователем
            }),
          )
          .orderBy('message.createdAt', 'DESC')
          .take(30)
          .skip(pagination)
          .getMany());

      if (!cachedMessages && messages.length !== 0) {
        await this.cacheService.set<Message[]>(
          `messages:${convertId}:${pagination}:seen`,
          messages,
          1860000,
        );
      }

      return messages.map((message) => ({
        id: message.id,
        content: message.content,
        messageNumber: message.messageNumber,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        convert: message.convert,
        sender: message.sender,
        attachmentToMessages: message.attachmentToMessages,
        seenStatuses: message.seenStatuses,
      }));
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при получении прочитанных сообщений в конверте',
      );
    }
  }

  async findUnseenForConvert(
    convertId: string,
    userPostIds: string[],
  ): Promise<MessageReadDto[]> {
    try {
      const cachedMessages = await this.cacheService.get<Message[]>(
        `messages:${convertId}:unseen`,
      );
      const messages =
        cachedMessages ??
        (await this.messageRepository
          .createQueryBuilder('message')
          .leftJoin('message.seenStatuses', 'seenStatus')
          .leftJoin('seenStatus.post', 'post')
          .leftJoin('post.user', 'reader')
          .leftJoinAndSelect(
            'message.attachmentToMessages',
            'attachmentToMessages',
          )
          .leftJoinAndSelect('attachmentToMessages.attachment', 'attachment')
          .leftJoinAndSelect('message.sender', 'sender')
          .leftJoinAndSelect('sender.user', 'user')
          .where('message.convertId = :convertId', { convertId })
          .andWhere('sender.id NOT IN (:...userPostIds)', { userPostIds })
          .andWhere(
            `NOT EXISTS (
            SELECT 1 FROM "message_seen_status" "mrs"
            WHERE "mrs"."messageId" = "message"."id"
            AND "mrs"."postId" IN (:...userPostIds)
          )`,
            { userPostIds },
          )
          .orderBy('message.createdAt', 'DESC')
          .getMany());

      if (!cachedMessages && messages.length !== 0) {
        await this.cacheService.set<Message[]>(
          `messages:${convertId}:unseen`,
          messages,
          1860000,
        );
      }

      return messages.map((message) => ({
        id: message.id,
        content: message.content,
        messageNumber: message.messageNumber,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        convert: message.convert,
        sender: message.sender,
        attachmentToMessages: message.attachmentToMessages,
        seenStatuses: message.seenStatuses,
      }));
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при получении непрочитанных сообщений в конверте',
      );
    }
  }

  async findOne(id: string, relations?: string[]): Promise<MessageReadDto> {
    try {
      const message = await this.messageRepository.findOne({
        where: { id: id },
        relations: relations ?? [],
      });

      if (!message) {
        throw new NotFoundException(`Сообщение с ID ${id} не найдено`);
      }

      const messageReadDto: MessageReadDto = {
        id: message.id,
        content: message.content,
        messageNumber: message.messageNumber,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        convert: message.convert,
        sender: message.sender,
        attachmentToMessages: message.attachmentToMessages,
        seenStatuses: message.seenStatuses,
      };
      return messageReadDto;
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при получении прочитанных сообщений в конверте',
      );
    }
  }

  async findBulk(ids: string[]): Promise<MessageReadDto[]> {
    try {
      const messages = await this.messageRepository.find({
        where: { id: In(ids) },
      });
      const foundIds = messages.map((message) => message.id);
      const missingIds = ids.filter((id) => !foundIds.includes(id));
      if (missingIds.length > 0) {
        throw new NotFoundException(
          `Не найдены сообщения с IDs: ${missingIds.join(', ')}`,
        );
      }
      return messages.map((message) => ({
        id: message.id,
        content: message.content,
        messageNumber: message.messageNumber,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        convert: message.convert,
        sender: message.sender,
        attachmentToMessages: message.attachmentToMessages,
        seenStatuses: message.seenStatuses,
      }));
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException('Ошибка при получении сообщений');
    }
  }

  async create(messageCreateDto: MessageCreateDto): Promise<string> {
    try {
      const createdMessage =
        await this.messageRepository.save(messageCreateDto);
      if (messageCreateDto.attachmentIds) {
        await this.attachmentToMessageService.createSeveral(
          createdMessage,
          messageCreateDto.attachmentIds,
        );
      }
      this.redis
        .keys(`undefined:messages:${messageCreateDto.convert.id}:*`)
        .then((keys) => {
          const pipeline = this.redis.pipeline();
          pipeline.unlink(keys);
          return pipeline.exec();
        });

      return createdMessage.id;
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException('Ошибка при создании сообщения');
    }
  }

  // async createBulk(messageCreateDtos: MessageCreateDto[]): Promise<void> {
  //   try {
  //     await this.messageRepository.insert(messageCreateDtos);
  //   } catch (err) {
  //     this.logger.error(err);
  //     throw new InternalServerErrorException('Ошибка при создании сообщения');
  //   }
  // }

  async update(
    _id: string,
    messageUpdateDto: MessageUpdateDto,
  ): Promise<string> {
    try {
      const message = await this.messageRepository.findOne({
        where: { id: _id },
        relations: ['convert'],
      });
      if (!message) {
        throw new NotFoundException(`Сообщение с ID ${_id} не найден`);
      }
      if (messageUpdateDto.content) message.content = messageUpdateDto.content;
      await this.messageRepository.update(_id, { content: message.content });

      this.redis
        .keys(`undefined:messages:${message.convert.id}`)
        .then((keys) => {
          const pipeline = this.redis.pipeline();
          pipeline.unlink(keys);
          return pipeline.exec();
        });

      return _id;
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException('Ошибка при обновлении сообщения');
    }
  }
}
