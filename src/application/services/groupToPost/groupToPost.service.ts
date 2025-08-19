import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from 'winston';
import { GroupToPost } from 'src/domains/groupToPost.entity';
import { GroupToPostRepository } from './repository/groupToPost.repository';
import { Group } from 'src/domains/group.entity';
import { GroupReadDto } from 'src/contracts/group/read-group.dto';
import { PostService } from '../post/post.service';

@Injectable()
export class GroupToPostService {
  constructor(
    @InjectRepository(GroupToPost)
    private readonly groupToPostRepository: GroupToPostRepository,
    private readonly postService: PostService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async createSeveral(group: Group, postIds: string[]): Promise<void> {
    try {
      const posts = await this.postService.findBulk(postIds);
      const groupToPosts = posts.map((post) => {
        const groupToPost = new GroupToPost();
        groupToPost.group = group;
        groupToPost.post = post;
        return groupToPost;
      });
      await this.groupToPostRepository.insert(groupToPosts);
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ой, что - то пошло не так при добавлении постов к группе!',
      );
    }
  }

  async remove(group: GroupReadDto): Promise<void> {
    await this.groupToPostRepository.delete({ group: group });
  }
}
