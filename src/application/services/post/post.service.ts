import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Post } from 'src/domains/post.entity';
import { PostRepository } from './repository/post.repository';
import { PostReadDto } from 'src/contracts/post/read-post.dto';
import { PostCreateDto } from 'src/contracts/post/create-post.dto';
import { Logger } from 'winston';
import { PostUpdateDto } from 'src/contracts/post/update-post.dto';
import { And, Brackets, In, IsNull, Not } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PostUpdateDefaultDto } from 'src/contracts/post/updateDefault-post.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: PostRepository,
    @Inject(CACHE_MANAGER)
    private readonly cacheService: Cache,
    @Inject('winston') private readonly logger: Logger,
  ) { }

  async findAllForOrganization(
    organizationId: string,
    structure: boolean,
    isArchive: boolean,
    relations?: string[],
  ): Promise<PostReadDto[]> {
    try {
      const posts = await this.postRepository.find({
        where: {
          organization: { id: organizationId },
          isArchive: isArchive,
        },
        relations: relations ?? [],
      });

      return posts.map((post) => ({
        id: post.id,
        postName: post.postName,
        divisionName: post.divisionName,
        divisionNumber: post.divisionNumber,
        parentId: post.parentId,
        product: post.product,
        purpose: post.purpose,
        isDefault: post.isDefault,
        isArchive: post.isArchive,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        user: post.user,
        policy: post.policy,
        statistics: post.statistics,
        organization: post.organization,
        account: post.account,
        convert: post.convert,
        historiesUsersToPost: post.historiesUsersToPost,
        targetHolders: post.targetHolders,
        convertToPosts: post.convertToPosts,
        messages: post.messages,
        controlPanels: post.controlPanels,
        role: post.role,
        groupToPosts: post.groupToPosts,
        goals: post.goals,
        policies: post.policies,
        strategies: post.strategies,
        projects: post.projects,
        underPosts:
          structure === true
            ? posts.filter((underPost) => underPost.parentId === post.id)
            : null,
      }));
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при получении всех постов для организации!',
      );
    }
  }

  async findAllForUser(
    userId: string,
    relations?: string[],
  ): Promise<PostReadDto[]> {
    try {
      const posts = await this.postRepository.find({
        where: {
          user: { id: userId },
          isArchive: false,
        },
        relations: relations ?? [],
      });

      return posts.map((post) => ({
        id: post.id,
        postName: post.postName,
        divisionName: post.divisionName,
        divisionNumber: post.divisionNumber,
        parentId: post.parentId,
        product: post.product,
        purpose: post.purpose,
        isDefault: post.isDefault,
        isArchive: post.isArchive,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        user: post.user,
        policy: post.policy,
        statistics: post.statistics,
        organization: post.organization,
        account: post.account,
        convert: post.convert,
        historiesUsersToPost: post.historiesUsersToPost,
        targetHolders: post.targetHolders,
        convertToPosts: post.convertToPosts,
        messages: post.messages,
        controlPanels: post.controlPanels,
        role: post.role,
        goals: post.goals,
        policies: post.policies,
        strategies: post.strategies,
        projects: post.projects,
        groupToPosts: post.groupToPosts,
      }));
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при получении всех постов для юзера!',
      );
    }
  }
  
async findUserPostsByOrganization(
  organizationId: string,
  userId: string,
  relations?: string[],
): Promise<PostReadDto[]> {
  try {
    // Логируем параметры запроса для отладки
    this.logger.debug(`Fetching posts for user ${userId} in organization ${organizationId}`);

    const posts = await this.postRepository.find({
      where: {
        organization: { id: organizationId },
        user: { id: userId }, // Ищем посты конкретного пользователя
        isArchive: false, // Только неархивные посты
      },
      relations: relations ?? ['user', 'organization'], // Дефолтные relations
    });

    this.logger.debug(`Found ${posts.length} posts for user ${userId}`);

    return posts.map(post => this.mapPostToDto(post));
    
  } catch (err) {
    this.logger.error(`Failed to fetch posts for user ${userId}`, err);
    throw new InternalServerErrorException('Ошибка при получении постов пользователя');
  }
}
// Вынесенный метод для маппинга сущности в DTO
private mapPostToDto(post: Post): PostReadDto {
  return {
    id: post.id,
    postName: post.postName,
    divisionName: post.divisionName,
    divisionNumber: post.divisionNumber,
    parentId: post.parentId,
    product: post.product,
    purpose: post.purpose,
    isDefault: post.isDefault,
    isArchive: post.isArchive,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
    user: post.user,
    policy: post.policy,
    statistics: post.statistics,
    organization: post.organization,
    account: post.account,
    convert: post.convert,
    historiesUsersToPost: post.historiesUsersToPost,
    targetHolders: post.targetHolders,
    convertToPosts: post.convertToPosts,
    messages: post.messages,
    controlPanels: post.controlPanels,
    role: post.role,
    goals: post.goals,
    policies: post.policies,
    strategies: post.strategies,
    projects: post.projects,
    groupToPosts: post.groupToPosts,
  };
}
  async findAllWithUserForOrganization(
    organizationId: string,
    userId: string,
    relations?: string[],
  ): Promise<PostReadDto[]> {
    try {
      const posts = await this.postRepository.find({
        where: {
          organization: { id: organizationId },
          user: { id: And(Not(IsNull()), Not(userId)) },
          isArchive: false,
        },
        relations: relations ?? [],
      });

      return posts.map((post) => ({
        id: post.id,
        postName: post.postName,
        divisionName: post.divisionName,
        divisionNumber: post.divisionNumber,
        parentId: post.parentId,
        product: post.product,
        purpose: post.purpose,
        isDefault: post.isDefault,
        isArchive: post.isArchive,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        user: post.user,
        policy: post.policy,
        statistics: post.statistics,
        organization: post.organization,
        account: post.account,
        convert: post.convert,
        historiesUsersToPost: post.historiesUsersToPost,
        targetHolders: post.targetHolders,
        convertToPosts: post.convertToPosts,
        messages: post.messages,
        controlPanels: post.controlPanels,
        role: post.role,
        goals: post.goals,
        policies: post.policies,
        strategies: post.strategies,
        projects: post.projects,
        groupToPosts: post.groupToPosts,
      }));
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при получении всех постов для организации!',
      );
    }
  }

  async findAllWithoutUserForOrganization(
    organizationId: string,
    relations?: string[],
  ): Promise<PostReadDto[]> {
    try {
      const posts = await this.postRepository.find({
        where: {
          organization: { id: organizationId },
          user: { id: IsNull() },
          isArchive: false,
        },
        relations: relations ?? [],
      });

      return posts.map((post) => ({
        id: post.id,
        postName: post.postName,
        divisionName: post.divisionName,
        divisionNumber: post.divisionNumber,
        parentId: post.parentId,
        product: post.product,
        purpose: post.purpose,
        isDefault: post.isDefault,
        isArchive: post.isArchive,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        user: post.user,
        policy: post.policy,
        statistics: post.statistics,
        organization: post.organization,
        account: post.account,
        convert: post.convert,
        historiesUsersToPost: post.historiesUsersToPost,
        targetHolders: post.targetHolders,
        convertToPosts: post.convertToPosts,
        messages: post.messages,
        controlPanels: post.controlPanels,
        role: post.role,
        goals: post.goals,
        policies: post.policies,
        strategies: post.strategies,
        projects: post.projects,
        groupToPosts: post.groupToPosts,
      }));

    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при получении всех постов без юзеров!',
      );
    }
  }

  async findAllContactsInOrganizationForCurrentUser(organizationId: string, userPostsIds: string[]): Promise<any> {
    try {
      const posts = await this.postRepository
        .createQueryBuilder('post')
        .leftJoin('post.user', 'user')
        .innerJoin('post.convertToPosts', 'ctp') // связь post → ConvertToPosts
        .innerJoin('ctp.convert', 'c') // связь ConvertToPosts → Convert (чаты)
        .leftJoin(
          'c.watchersToConvert',
          'wtc',
          'wtc.postId IN (:...userPostsIds)',
          { userPostsIds },
        )
        .leftJoin('wtc.post', 'watcher')
        .leftJoin(
          'c.messages',
          'unreadMessages',
          `NOT EXISTS (
            SELECT 1 FROM "message_seen_status" "mrs"
            WHERE "mrs"."messageId" = "unreadMessages"."id"
            AND "mrs"."postId" IN (:...userPostsIds)
          ) 
          AND "unreadMessages"."senderId" NOT IN (:...userPostsIds)
          AND "watcher"."id" IS NULL
          AND ("c"."pathOfPosts"[1] IN (:...userPostsIds) OR "c"."activePostId" IN (:...userPostsIds))`,
          { userPostsIds },
        )
        .leftJoin(
          'c.messages',
          'latestMessage',
          '"latestMessage"."messageNumber" = (SELECT MAX("m"."messageNumber") FROM "message" "m" WHERE "m"."convertId" = "c"."id")',
        )
        .where('"post"."organizationId" = :organizationId', { organizationId })
        .andWhere('"post"."id" NOT IN (:...userPostsIds)', { userPostsIds })
        .andWhere('"c"."convertStatus" = true')
        .andWhere(
          new Brackets((qb) => {
            qb.where('"c"."pathOfPosts"[1] IN (:...userPostsIds)', {
              userPostsIds,
            })
              .andWhere(
                '"c"."pathOfPosts"[array_length("c"."pathOfPosts", 1)] = "post"."id"',
              )
              .orWhere(
                new Brackets((qb) => {
                  qb.where('"c"."pathOfPosts"[1] = "post"."id"')
                    .andWhere(
                      new Brackets((qb) => {
                        qb.where(
                          `EXISTS (
                      SELECT 1 FROM "convert_to_post" "sub_ctp"
                      INNER JOIN "post" "sub_post" ON "sub_ctp"."postId" = "sub_post"."id"
                      WHERE "sub_ctp"."convertId" = c.id
                      AND "sub_post"."id" IN (:...userPostsIds)
                  )`, { userPostsIds }
                        )
                          .orWhere('watcher.id IN (:...userPostsIds)', {
                            userPostsIds,
                          });
                      }),
                    );
                }),
              );
          }),
        )
        .select([
          'post.id AS "id"',
          'post.postName AS "postName"',
          'post.divisionName AS "divisionName"',
          'post.createdAt AS "createdAt"',
          'post.updatedAt AS "updatedAt"',
          'user.id AS "userId"',
          'user.firstName AS "userFirstName"',
          'user.lastName AS "userLastName"',
          'user.telegramId AS "userTelegramId"',
          'user.telephoneNumber AS "userTelephoneNumber"',
          'user.avatar_url AS "userAvatar"',
          'MAX("latestMessage"."createdAt") AS "latestMessageCreatedAt"',
          'SUM("wtc"."unreadMessagesCount") AS "watcherUnseenCount"',
          'COUNT("unreadMessages"."id") AS "unseenMessagesCount"',
        ])
        .groupBy('post.id, user.id')
        .getRawMany();
      return posts;
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при получении всех контактов!',
      );
    }
  }

  async findAllWithoutConvertForOrganization(
    organizationId: string,
    postsWithConvertsIds: string[],
    relations?: string[]
  ): Promise<PostReadDto[]> {
    try {
      const posts = await this.postRepository.find({
        where: {
          organization: { id: organizationId },
          user: { id: Not(IsNull()) },
          isArchive: false,
          id: Not(In(postsWithConvertsIds)),
        },
        relations: relations ?? [],
      });

      return posts.map((post) => ({
        id: post.id,
        postName: post.postName,
        divisionName: post.divisionName,
        divisionNumber: post.divisionNumber,
        parentId: post.parentId,
        product: post.product,
        purpose: post.purpose,
        isDefault: post.isDefault,
        isArchive: post.isArchive,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        user: post.user,
        policy: post.policy,
        statistics: post.statistics,
        organization: post.organization,
        account: post.account,
        convert: post.convert,
        historiesUsersToPost: post.historiesUsersToPost,
        targetHolders: post.targetHolders,
        convertToPosts: post.convertToPosts,
        messages: post.messages,
        controlPanels: post.controlPanels,
        role: post.role,
        goals: post.goals,
        policies: post.policies,
        strategies: post.strategies,
        projects: post.projects,
        groupToPosts: post.groupToPosts,
      }));
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при получении всех постов для организации без конвертов!',
      );
    }
  }

  async findBulk(ids: string[], relations?: string[]): Promise<PostReadDto[]> {
    try {
      const posts = await this.postRepository.find({
        where: { id: In(ids) },
        relations: relations ?? [],
      });
      const foundIds = posts.map((post) => post.id);
      const missingIds = ids.filter((id) => !foundIds.includes(id));
      if (missingIds.length > 0) {
        throw new NotFoundException(
          `Не найдены посты с IDs: ${missingIds.join(', ')}`,
        );
      }
      return posts.map((post) => ({
        id: post.id,
        postName: post.postName,
        divisionName: post.divisionName,
        divisionNumber: post.divisionNumber,
        parentId: post.parentId,
        product: post.product,
        purpose: post.purpose,
        isDefault: post.isDefault,
        isArchive: post.isArchive,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        user: post.user,
        policy: post.policy,
        statistics: post.statistics,
        organization: post.organization,
        account: post.account,
        convert: post.convert,
        historiesUsersToPost: post.historiesUsersToPost,
        targetHolders: post.targetHolders,
        convertToPosts: post.convertToPosts,
        messages: post.messages,
        controlPanels: post.controlPanels,
        role: post.role,
        goals: post.goals,
        policies: post.policies,
        strategies: post.strategies,
        projects: post.projects,
        groupToPosts: post.groupToPosts,
      }));
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException('Ошибка при получении статистик');
    }
  }

  async findOneById(id: string, relations?: string[]): Promise<PostReadDto> {
    try {
      const post = await this.postRepository.findOne({
        where: { id: id },
        relations: relations ?? [],
      });

      if (!post) throw new NotFoundException(`Пост с ID: ${id} не найден`);
      const postReadDto: PostReadDto = {
        id: post.id,
        postName: post.postName,
        divisionName: post.divisionName,
        divisionNumber: post.divisionNumber,
        parentId: post.parentId,
        product: post.product,
        purpose: post.purpose,
        isDefault: post.isDefault,
        isArchive: post.isArchive,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        user: post.user,
        policy: post.policy,
        statistics: post.statistics,
        organization: post.organization,
        account: post.account,
        convert: post.convert,
        historiesUsersToPost: post.historiesUsersToPost,
        targetHolders: post.targetHolders,
        convertToPosts: post.convertToPosts,
        messages: post.messages,
        controlPanels: post.controlPanels,
        role: post.role,
        goals: post.goals,
        policies: post.policies,
        strategies: post.strategies,
        projects: post.projects,
        groupToPosts: post.groupToPosts,
      };

      return postReadDto;
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException('Ошибка при получении поста');
    }
  }

  async findMaxDivisionNumber(organizationId: string): Promise<number> {
    try {
      const maxDivisionNumber = await this.postRepository.maximum(
        'divisionNumber',
        { organization: { id: organizationId } },
      );
      if (!maxDivisionNumber) return 0;
      return maxDivisionNumber;
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new InternalServerErrorException('Ошибка при получении поста');
    }
  }

  async getHierarchyToTop(postId: string): Promise<string[]> {
    const hierarchyIds: string[] = [];
    let currentPost = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['user'],
    });
    while (currentPost && currentPost.parentId) {
      hierarchyIds.push(currentPost.id);
      currentPost = await this.postRepository.findOne({
        where: { id: currentPost.parentId },
        relations: ['user'],
      });
    }
    // Добавляем верхний уровень (пост без parentId)
    if (currentPost) hierarchyIds.push(currentPost.id);
    return hierarchyIds;
  }

  async getParentPosts(postId: string): Promise<PostReadDto[]> {
    const parentPosts: PostReadDto[] = [];
    let currentPost = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['user'],
    });
    while (currentPost && currentPost.parentId) {
      parentPosts.push(currentPost);
      currentPost = await this.postRepository.findOne({
        where: { id: currentPost.parentId },
        relations: ['user'],
      });
    }
    // Добавляем верхний уровень (пост без parentId)
    if (currentPost) parentPosts.push(currentPost);
    return parentPosts;
  }

  async getChildrenPosts(postId: string): Promise<PostReadDto[]> {
    const childrenPosts: PostReadDto[] = [];
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['user'],
    });
    // Находим прямых потомков
    const directChildren = await this.postRepository.find({
      where: { parentId: post.id, user: { id: Not(post.user.id) } },
      relations: ['user'],
    });
    // Добавляем прямых потомков в результат
    childrenPosts.push(...directChildren);
    // Рекурсивно ищем потомков для каждого прямого потомка
    for (const child of directChildren) {
      const grandchildren = await this.getChildrenPosts(child.id);
      childrenPosts.push(...grandchildren);
    }
    return childrenPosts;
  }

  async create(postCreateDto: PostCreateDto): Promise<string> {
    try {
      const post = new Post();
      post.postName = postCreateDto.postName;
      post.divisionName = postCreateDto.divisionName;
      post.parentId = postCreateDto.parentId;
      post.product = postCreateDto.product;
      post.purpose = postCreateDto.purpose;
      post.user = postCreateDto.user ?? null;
      post.organization = postCreateDto.organization;
      post.policy = postCreateDto.policy;
      post.account = postCreateDto.account;
      post.role = postCreateDto.role;
      if (postCreateDto.user?.posts?.length < 1) {
        post.isDefault = true;
      }

      const createdPostId = await this.postRepository.insert(post);
      if (postCreateDto.responsibleUserId) {
        await this.cacheService.del(`user:${postCreateDto.responsibleUserId}`);
      }
      return createdPostId.identifiers[0].id;
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException('Ошибка при создании поста');
    }
  }

  async update(_id: string, updatePostDto: PostUpdateDto): Promise<string> {
    try {
      const post = await this.postRepository.findOne({
        where: { id: _id },
        relations: ['user']
      });

      if (!post) {
        throw new NotFoundException(`Пост с ID ${_id} не найден`);
      }

      if (updatePostDto.postName) post.postName = updatePostDto.postName;

      if (updatePostDto.divisionName)
        post.divisionName = updatePostDto.divisionName;

      if (updatePostDto.parentId !== null) {
        post.parentId = updatePostDto.parentId;
      } else {
        post.parentId = null;
      }

      if (updatePostDto.product) post.product = updatePostDto.product;

      if (updatePostDto.purpose) post.purpose = updatePostDto.purpose;

      if (updatePostDto.responsibleUserId !== null) {
        post.user = updatePostDto.user;
        await Promise.all([
          await this.cacheService.del(`user:${updatePostDto.responsibleUserId}`),
          post.user ? await this.cacheService.del(`user:${post.user.id}`) : null
        ])
      } else {
        post.user = null;
      }

      if (updatePostDto.policyId !== null) {
        post.policy = updatePostDto.policy;
      } else {
        post.policy = null;
      }


      if (updatePostDto.roleId !== null) {
        post.role = updatePostDto.role;
      }

      if (updatePostDto.isArchive != null)
        post.isArchive = updatePostDto.isArchive;

      await this.postRepository.update(post.id, {
        postName: post.postName,
        divisionName: post.divisionName,
        parentId: post.parentId,
        product: post.product,
        purpose: post.purpose,
        isArchive: post.isArchive,
        user: post.user,
        organization: post.organization,
        policy: post.policy,
        role: post.role
      });
      return post.id;
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new InternalServerErrorException('Ошибка при обновлении поста');
    }
  }

  async updateDefaultPost(
    _id: string,
    postUpdateDefaultDto: PostUpdateDefaultDto,
  ): Promise<string> {
    try {
      const post = await this.postRepository.findOne({ where: { id: _id } });
      const newDefaultPost = await this.postRepository.findOne({
        where: { id: postUpdateDefaultDto.newDefaultPostId },
      });
      if (!post) {
        throw new NotFoundException(`Пост с ID ${_id} не найден`);
      }
      if (!newDefaultPost) {
        throw new NotFoundException(
          `Пост с ID ${postUpdateDefaultDto.newDefaultPostId} не найден`,
        );
      }
      await Promise.all([
        await this.postRepository.update(post.id, { isDefault: false }),
        await this.postRepository.update(
          postUpdateDefaultDto.newDefaultPostId,
          { isDefault: true },
        ),
      ]);
      return newDefaultPost.id;
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new InternalServerErrorException(
        'Ошибка при смене поста по умолчанию',
      );
    }
  }
}
