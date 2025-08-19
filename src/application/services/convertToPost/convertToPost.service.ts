import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from 'winston';
import { ConvertToPost } from 'src/domains/convertToPost.entity';
import { ConvertToPostRepository } from './repository/convertToPost.repository';
import { Convert } from 'src/domains/convert.entity';
import { ConvertReadDto } from 'src/contracts/convert/read-convert.dto';
import { PostService } from '../post/post.service';

@Injectable()
export class ConvertToPostService {
  constructor(
    @InjectRepository(ConvertToPost)
    private readonly convertToPostRepository: ConvertToPostRepository,
    private readonly postService: PostService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async createSeveral(convert: Convert, postIds: string[]): Promise<void> {
    try {
      const posts = await this.postService.findBulk(postIds);

      const convertToPosts = posts.map((post) => {
        const convertToPost = new ConvertToPost();
        convertToPost.post = post;
        convertToPost.convert = convert;
        return convertToPost;
      });

      await this.convertToPostRepository.insert(convertToPosts);
    } catch (err) {
      this.logger.error(err);

      throw new InternalServerErrorException(
        'Ой, что - то пошло не так при добавлении участников к конверту!',
      );
    }
  }

  // async createSeveralBulk(converts: Convert[]): Promise<void> {
  //   try {
  //     const allPostIds = converts
  //       .map(convert => convert.pathOfPosts.slice(0, 2))
  //       .flat();
  //     const uniquePostIds = [...new Set(allPostIds)];

  //     const posts = await this.postService.findBulk(uniquePostIds);
  //     const postMap = new Map(posts.map(post => [post.id, post]));

  //     const convertToPosts: ConvertToPost[] = [];

  //     for (const convert of converts) {
  //       const postIdsForConvert = convert.pathOfPosts.slice(0, 2);

  //       for (const postId of postIdsForConvert) {
  //         const post = postMap.get(postId);

  //         if (!post) {
  //           throw new NotFoundException(`Не найден пост с ID: ${postId} для конверта ${convert.id} `)
  //         }

  //         const convertToPost = new ConvertToPost();
  //         convertToPost.post = post;
  //         convertToPost.convert = convert;
  //         convertToPosts.push(convertToPost);
  //       }
  //     }

  //     await this.convertToPostRepository.insert(convertToPosts);
  //   } catch (err) {
  //     this.logger.error(err);
  //     throw new InternalServerErrorException(
  //       'Ой, что-то пошло не так при массовом добавлении участников к конвертам!',
  //     );
  //   }
  // }

  async remove(convert: ConvertReadDto): Promise<void> {
    try {
      await this.convertToPostRepository.delete({ convert: convert });
    } catch (err) {
      this.logger.error(err);

      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new InternalServerErrorException(
        'Ой, что - то пошло не так при удалении конверта!',
      );
    }
  }
}
