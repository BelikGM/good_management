import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Convert, TypeConvert } from 'src/domains/convert.entity';
import { ConvertRepository } from './repository/convert.repository';
import { ConvertReadDto } from 'src/contracts/convert/read-convert.dto';
import { Logger } from 'winston';
import { ConvertCreateDto } from 'src/contracts/convert/create-convert.dto';
import { ConvertToPostService } from '../convertToPost/convertToPost.service';
import { ConvertUpdateDto } from 'src/contracts/convert/update-convert.dto';
import { WatchersToConvertService } from '../watchersToConvert/watchersToConvert.service';
import { Brackets } from 'typeorm';
import { TargetService } from '../target/target.service';
import { MessageService } from '../message/message.service';
import { MessageCreateDto } from 'src/contracts/message/create-message.dto';
import { Transactional } from 'nestjs-transaction';

@Injectable()
export class ConvertService {
  constructor(
    @InjectRepository(Convert)
    private readonly convertRepository: ConvertRepository,
    private readonly convertToPostService: ConvertToPostService,
    private readonly watchersToConvertService: WatchersToConvertService,
    private readonly targetService: TargetService,
    private readonly messageService: MessageService,
    @Inject('winston') private readonly logger: Logger,
  ) { }

  async findAllArchiveForContact(
    userPostsIds: string[],
    contactId: string,
    pagination
  ): Promise<any[]> {
    try {
      const converts = await this.convertRepository
        .createQueryBuilder('convert')
        .innerJoin('convert.convertToPosts', 'convertToPost')
        .innerJoin('convertToPost.post', 'post')
        .leftJoin(
          'convert.messages',
          'latestMessage',
          '"latestMessage"."messageNumber" = (SELECT MAX("m"."messageNumber") FROM "message" "m" WHERE "m"."convertId" = "convert"."id")',
        )
        .where('post.id IN (:...userPostsIds)', { userPostsIds })
        .andWhere('convert.convertStatus = false')
        .andWhere(
          new Brackets((qb) => {
            qb.where('"convert"."pathOfPosts"[1] IN (:...userPostsIds)', {
              userPostsIds,
            })
              .andWhere(
                '"convert"."pathOfPosts"[array_length("convert"."pathOfPosts", 1)] = :contactId',
                { contactId },
              )
              .orWhere(
                new Brackets((qb) => {
                  qb.where('"convert"."pathOfPosts"[1] = :contactId', {
                    contactId,
                  }).andWhere(
                    '"convert"."activePostId" NOT IN (:...userPostsIds)',
                    { userPostsIds },
                  );
                }),
              );
          }),
        )
        .orWhere(
          new Brackets((qb) => {
            qb.where('convert.convertStatus = true')
              .andWhere('"convert"."pathOfPosts"[1] = :contactId', {
                contactId,
              })
              .andWhere('"convert"."activePostId" NOT IN (:...userPostsIds)', {
                userPostsIds,
              })
              .andWhere(
                '"convert"."pathOfPosts" && ARRAY[:...userPostsIds]::uuid[]',
                { userPostsIds },
              );
          }),
        )
        .select([
          'convert.*',
          '"latestMessage"."content" AS "latestMessageContent"',
          '"latestMessage"."createdAt" AS "latestMessageCreatedAt"',
        ])
        .groupBy(
          'convert.id , "latestMessage"."content", "latestMessage"."createdAt"',
        )
        .orderBy('convert.dateFinish', 'DESC')
        .take(20)
        .skip(pagination)
        .getRawMany();
      return converts;
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException('Ошибка при получении конверта');
    }
  }

  async findAllArchiveCopiesForContact(
    userPostsIds: string[],
    contactId: string,
    pagination: number
  ): Promise<any[]> {
    try {
      const converts = await this.convertRepository
        .createQueryBuilder('convert')
        .innerJoin('convert.convertToPosts', 'convertToPost')
        .innerJoin('convertToPost.post', 'post')
        .leftJoinAndSelect('convert.watchersToConvert', 'wtc')
        .leftJoin('wtc.post', 'watcher')
        .where('watcher.id IN (:...userPostsIds)', { userPostsIds })
        .andWhere('"convert"."pathOfPosts"[1] = :contactId', { contactId })
        .andWhere('wtc.unreadMessagesCount = 0')
        .orderBy('convert.dateFinish', 'DESC')
        .take(20)
        .skip(pagination)
        .getMany();
      return converts;
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException('Ошибка при получении конверта');
    }
  }

  async findAllForContact(
    userPostsIds: string[],
    contactId: string
  ): Promise<any[]> {
    try {
      const converts = await this.convertRepository
        .createQueryBuilder('convert')
        .innerJoin('convert.convertToPosts', 'convertToPost')
        .innerJoin('convertToPost.post', 'post')
        .leftJoin(
          'convert.messages',
          'unreadMessages',
          `NOT EXISTS (
          SELECT 1 FROM "message_seen_status" "mrs"
          WHERE "mrs"."messageId" = "unreadMessages"."id"
          AND "mrs"."postId" IN (:...userPostsIds)
        ) 
        AND "unreadMessages"."senderId" NOT IN (:...userPostsIds)`,
        )
        .leftJoin(
          'convert.messages',
          'latestMessage',
          '"latestMessage"."messageNumber" = (SELECT MAX("m"."messageNumber") FROM "message" "m" WHERE "m"."convertId" = "convert"."id")',
        )
        .where('post.id IN (:...userPostsIds)', { userPostsIds })
        .andWhere('convert.convertStatus = true')
        .andWhere(
          new Brackets((qb) => {
            qb.where('"convert"."pathOfPosts"[1] IN (:...userPostsIds)', {
              userPostsIds,
            })
              .andWhere(
                '"convert"."pathOfPosts"[array_length("convert"."pathOfPosts", 1)] = :contactId',
                { contactId },
              )
              .orWhere(
                new Brackets((qb) => {
                  qb.where('"convert"."pathOfPosts"[1] = :contactId', {
                    contactId,
                  }).andWhere(
                    '"convert"."activePostId" IN (:...userPostsIds)',
                    { userPostsIds },
                  );
                }),
              );
          }),
        )
        .select([
          'convert.*',
          '"latestMessage"."content" AS "latestMessageContent"',
          '"latestMessage"."createdAt" AS "latestMessageCreatedAt"',
          'COUNT("unreadMessages"."id") AS "unseenMessagesCount"',
        ])
        .groupBy(
          'convert.id , "latestMessage"."content", "latestMessage"."createdAt"',
        )
        .orderBy('convert.dateStart', 'ASC')
        .getRawMany();
      return converts;
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException('Ошибка при получении конверта');
    }
  }

  async findAllCopiesForContact(
    userPostsIds: string[],
    contactId: string,
  ): Promise<any[]> {
    try {
      const converts = await this.convertRepository
        .createQueryBuilder('convert')
        .innerJoin('convert.convertToPosts', 'convertToPost')
        .innerJoin('convertToPost.post', 'post')
        .leftJoinAndSelect('convert.watchersToConvert', 'wtc')
        .leftJoin('wtc.post', 'watcher')
        .where('watcher.id IN (:...userPostsIds)', { userPostsIds })
        .andWhere('"convert"."pathOfPosts"[1] = :contactId', { contactId })
        .andWhere('wtc.unreadMessagesCount > 0')
        .orderBy('convert.dateStart', 'ASC')
        .getMany();
      return converts;
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException('Ошибка при получении конверта');
    }
  }

  async findOneById(id: string, relations?: string[]): Promise<ConvertReadDto> {
    try {
      const convert = await this.convertRepository.findOne({
        where: { id: id },
        relations: relations ?? [],
      });

      if (!convert)
        throw new NotFoundException(`Конверт с ID: ${id} не найдена!`);
      const convertReadDto: ConvertReadDto = {
        id: convert.id,
        convertTheme: convert.convertTheme,
        pathOfPosts: convert.pathOfPosts,
        convertType: convert.convertType,
        convertPath: convert.convertPath,
        convertStatus: convert.convertStatus,
        activePostId: convert.activePostId,
        dateStart: convert.dateStart,
        deadline: convert.deadline,
        dateFinish: convert.dateFinish,
        createdAt: convert.createdAt,
        messages: convert.messages,
        convertToPosts: convert.convertToPosts,
        host: convert.host,
        account: convert.account,
        target: convert.target,
        watchersToConvert: convert.watchersToConvert,
      };
      return convertReadDto;
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException('Ошибка при получении конверта');
    }
  }

  @Transactional()
  async create(convertCreateDto: ConvertCreateDto): Promise<ConvertReadDto> {
    try {
      const convert = new Convert();
      convert.convertTheme = convertCreateDto.convertTheme;
      convert.pathOfPosts = convertCreateDto.pathOfPosts;
      convert.dateStart = new Date();
      convert.deadline = convertCreateDto.deadline;
      convert.convertType = convertCreateDto.convertType;
      convert.convertPath = convertCreateDto.convertPath;
      convert.activePostId = convertCreateDto.pathOfPosts[1];
      convert.host = convertCreateDto.host;
      convert.account = convertCreateDto.account;
      const createdConvert = await this.convertRepository.save(convert);

      const messageCreateDto: MessageCreateDto = {
        content:
          convertCreateDto.targetCreateDto !== undefined
            ? convertCreateDto.targetCreateDto.content
            : convertCreateDto.convertTheme,
        postId: convertCreateDto.host.id,
        attachmentIds:
          convertCreateDto.targetCreateDto !== undefined
            ? convertCreateDto.targetCreateDto.attachmentIds
            : undefined,
        convert: createdConvert,
        sender: convert.host,
      };

      const postsToConvert = convertCreateDto.pathOfPosts
        .slice(0, 2)
        .concat(
          convertCreateDto.pathOfPosts[convertCreateDto.pathOfPosts.length - 1],
        )
        .filter(
          (postId, index, arr) =>
            index === arr.findIndex((id) => id === postId),
        );

      if (convertCreateDto.targetCreateDto)
        convertCreateDto.targetCreateDto.convert = createdConvert;

      await Promise.all([
        this.convertToPostService.createSeveral(createdConvert, postsToConvert),
        convertCreateDto.targetCreateDto
          ? this.targetService.create(convertCreateDto.targetCreateDto)
          : null,
        convertCreateDto.convertType !== TypeConvert.CHAT
          ? this.messageService.create(messageCreateDto)
          : null,
      ]);
      return createdConvert;
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException('Ошибка при создании конверта');
    }
  }

  // async createBulkForProject(convertCreateDtos: ConvertCreateDto[]): Promise<Convert[]> {
  //   try {

  //     const createdConverts = await this.convertRepository.save(convertCreateDtos);

  //     const messageCreateDtos: MessageCreateDto[] = [];
  //     createdConverts.forEach(convert => {
  //       const messageCreateDto = {
  //           content: convert.convertTheme,
  //           postId: convert.senderPostId,
  //           convert: convert,
  //           sender: convert.host
  //         };
  //         messageCreateDtos.push(messageCreateDto);
  //     })

  //     await Promise.all([
  //       this.convertToPostService.createSeveralBulk(createdConverts),
  //       this.messageService.createBulk(messageCreateDtos)
  //     ])
  //     return createdConverts;
  //   } catch (err) {
  //     this.logger.error(err);
  //     throw new InternalServerErrorException('Ошибка при создании конверта');
  //   }
  // }

  async update(
    _id: string,
    convertUpdateDto: ConvertUpdateDto,
  ): Promise<string> {
    try {
      const convert = await this.convertRepository
        .createQueryBuilder('convert')
        .leftJoinAndSelect(
          'convert.messages',
          'latestMessage',
          '"latestMessage"."messageNumber" = (SELECT MAX("m"."messageNumber") FROM "message" "m" WHERE "m"."convertId" = "convert"."id")',
        )
        .where('convert.id = :_id', { _id })
        .getOne();

      if (!convert) {
        throw new NotFoundException(`Конверт с ID ${_id} не найден`);
      }
      if (convertUpdateDto.activePostId) {
        convert.activePostId = convertUpdateDto.activePostId;
      }
      if (convertUpdateDto.convertStatus != null) {
        convert.convertStatus = convertUpdateDto.convertStatus;
        convert.dateFinish = new Date();
      }
      if (convertUpdateDto.watcherIds) {
        await this.watchersToConvertService.remove(convert);
        await this.watchersToConvertService.createSeveral(
          convert,
          convertUpdateDto.watcherIds,
          convert.messages[0].messageNumber,
        );
      }
      if (convertUpdateDto.convertToPostIds) {
        await this.convertToPostService.remove(convert);
        await this.convertToPostService.createSeveral(
          convert,
          convertUpdateDto.convertToPostIds,
        );
      }
      await this.convertRepository.update(convert.id, {
        activePostId: convert.activePostId,
        convertStatus: convert.convertStatus,
        dateFinish: convert.dateFinish,
      });
      return convert.id;
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new InternalServerErrorException('Ошибка при обновлении конверта');
    }
  }

  async updateFromProject(
    _id: string,
    convertUpdateDto: ConvertUpdateDto,
  ): Promise<string> {
    try {
      const convert = await this.convertRepository
        .createQueryBuilder('convert')
        .where('convert.id = :_id', { _id })
        .getOne();

      if (!convert) {
        throw new NotFoundException(`Конверт с ID ${_id} не найден`);
      }
      if (convertUpdateDto.convertTheme) {
        convert.convertTheme = convertUpdateDto.convertTheme;
      }
      if (convertUpdateDto.activePostId) {
        convert.activePostId = convertUpdateDto.pathOfPosts[1];
      }
      if (convertUpdateDto.convertStatus != null) {
        convert.convertStatus = convertUpdateDto.convertStatus;
        convert.dateFinish = new Date();
      }
      if (convertUpdateDto.deadline) {
        convert.deadline = convertUpdateDto.deadline;
      }
      if (convertUpdateDto.pathOfPosts) {
        convert.pathOfPosts = convertUpdateDto.pathOfPosts;
      }
      if (convertUpdateDto.convertPath) {
        convert.convertPath = convertUpdateDto.convertPath;
      }
      if (convertUpdateDto.host) {
        convert.host = convertUpdateDto.host;
      }

      if (convertUpdateDto.pathOfPosts) {
        const postsToConvert = convertUpdateDto.pathOfPosts
          .slice(0, 2)
          .concat(
            convertUpdateDto.pathOfPosts[
            convertUpdateDto.pathOfPosts.length - 1
            ],
          )
          .filter(
            (postId, index, arr) =>
              index === arr.findIndex((id) => id === postId),
          );

        await this.convertToPostService.remove(convert);
        await this.convertToPostService.createSeveral(convert, postsToConvert);
      }
      await this.convertRepository.update(convert.id, {
        convertTheme: convert.convertTheme,
        activePostId: convert.activePostId,
        convertStatus: convert.convertStatus,
        dateFinish: convert.dateFinish,
        deadline: convert.deadline,
        pathOfPosts: convert.pathOfPosts,
        convertPath: convert.convertPath,
        host: convert.host,
      });
      return convert.id;
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new InternalServerErrorException(
        'Ошибка при обновлении конверта из проекта',
      );
    }
  }
}
