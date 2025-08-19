import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from 'winston';
import { HistoryUsersToPostRepository } from './repository/historyUsersToPost.repository';
import { AccountReadDto } from 'src/contracts/account/read-account.dto';
import { HistoryUsersToPostReadDto } from 'src/contracts/historyUsersToPost/read-historyUsersToPost.dto';
import { PostReadDto } from 'src/contracts/post/read-post.dto';
import { HistoryUsersToPost } from 'src/domains/historyUsersToPost.entity';
import { HistoryUsersToPostCreateDto } from 'src/contracts/historyUsersToPost/create-historyUsersToPost.dto';

@Injectable()
export class HistoryUsersToPostService {
  constructor(
    @InjectRepository(HistoryUsersToPost)
    private readonly historyUsersToPostRepository: HistoryUsersToPostRepository,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async findAllForPost(
    post: PostReadDto,
  ): Promise<HistoryUsersToPostReadDto[]> {
    try {
      const historiesUsersToPost = await this.historyUsersToPostRepository.find(
        {
          where: { post: { id: post.id } },
        },
      );

      return historiesUsersToPost.map((historiyUsersToPost) => ({
        id: historiyUsersToPost.id,
        createdAt: historiyUsersToPost.createdAt,
        updatedAt: historiyUsersToPost.updatedAt,
        user: historiyUsersToPost.user,
        post: historiyUsersToPost.post,
      }));
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при получении всех историй!',
      );
    }
  }

  async create(
    historyUsersToPostCreateDto: HistoryUsersToPostCreateDto,
  ): Promise<string> {
    try {
      const historyUsersToPost = new HistoryUsersToPostCreateDto();
      historyUsersToPost.user = historyUsersToPostCreateDto.user;
      historyUsersToPost.post = historyUsersToPostCreateDto.post;
      const createdHistoryUsersToPost =
        await this.historyUsersToPostRepository.insert(historyUsersToPost);

      return createdHistoryUsersToPost.identifiers[0].id;
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException('Ошибка при создании истории');
    }
  }
}
