import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { OrganizationService } from 'src/application/services/organization/organization.service';
import { PolicyService } from 'src/application/services/policy/policy.service';
import { PostService } from 'src/application/services/post/post.service';
import { UsersService } from 'src/application/services/users/users.service';
import { PolicyReadDto } from 'src/contracts/policy/read-policy.dto';
import { PostCreateDto } from 'src/contracts/post/create-post.dto';
import { PostReadDto } from 'src/contracts/post/read-post.dto';
import { ReadUserDto } from 'src/contracts/user/read-user.dto';
import { Logger } from 'winston';
import { yellow } from 'colorette';
import { PostUpdateDto } from 'src/contracts/post/update-post.dto';
import { ProducerService } from 'src/application/services/producer/producer.service';
import { PostCreateEventDto } from 'src/contracts/post/createEvent-post.dto';
import { PostUpdateEventDto } from 'src/contracts/post/updateEvent-post.dto';
import { GroupService } from 'src/application/services/group/group.service';
import { HistoryUsersToPostService } from 'src/application/services/historyUsersToPost/historyUsersToPost.service';
import { HistoryUsersToPostCreateDto } from 'src/contracts/historyUsersToPost/create-historyUsersToPost.dto';
import { AccessTokenGuard } from 'src/guards/accessToken.guard';
import { Request as ExpressRequest } from 'express';
import {
  beforeCreateExample,
  findAllContactsExample,
  findAllMyPostsExample,
  findAllPostsExample,
  findAllUnderPostsExample,
  findOnePostExample,
} from 'src/constants/swagger-examples/post/post-examples';
import { RoleService } from 'src/application/services/role/role.service';
import { RoleReadDto } from 'src/contracts/role/read-role.dto';
import { PostUpdateDefaultDto } from 'src/contracts/post/updateDefault-post.dto';
import { ActionAccess } from 'src/decorators/action-access.decorator';
import { ModuleAccess } from 'src/decorators/module-access.decorator';
import { Modules, Actions } from 'src/domains/roleSetting.entity';
import { PermissionsGuard } from 'src/guards/permission.guard';
@ApiTags('Posts')
@ApiBearerAuth('access-token')
@UseGuards(AccessTokenGuard)
@Controller('posts')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly userService: UsersService,
    private readonly policyService: PolicyService,
    private readonly organizationService: OrganizationService,
    private readonly roleService: RoleService,
    private readonly producerService: ProducerService,
    private readonly groupService: GroupService,
    private readonly historyUsersToPostService: HistoryUsersToPostService,
    @Inject('winston') private readonly logger: Logger,
  ) { }

  @Get('myPosts')
  @ApiOperation({ summary: 'Получить все свои посты' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: findAllMyPostsExample,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Вы не авторизованы!',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  async findAllMyPosts(@Req() req: ExpressRequest): Promise<PostReadDto[]> {
    const user = req.user as ReadUserDto;
    return user.posts;
  }

  @Get('myPostsInOrganization/:organizationId')
  @ApiOperation({ summary: 'Получить все посты текущего пользователя в организации' })
  @ApiResponse({ status: 200, description: 'Список постов пользователя', type: [PostReadDto] })
  async getMyPostsInOrganization(
  @Param('organizationId') organizationId: string,
  @Req() req: ExpressRequest, // Получаем запрос для доступа к пользователю
  @Query('relations') relations?: string[],
): Promise<PostReadDto[]> {
  const user = req.user as ReadUserDto; // Предполагается, что пользователь есть в запросе
  return this.postService.findUserPostsByOrganization(
    organizationId,
    user.id, // Используем ID авторизованного пользователя
    relations,
  );
}



   @Get(':organizationId/contacts')
  @UseGuards(PermissionsGuard)
  @ModuleAccess(Modules.POST)
  @ActionAccess(Actions.READ)
  @ApiOperation({ summary: 'Все контакты в организации' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: findAllContactsExample,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Вы не авторизованы!',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiParam({
    name: 'organizationId',
    required: true,
    description: 'Id организации',
    example: 'bdb6b98b-d036-4878-bb3d-e4b1271aae89',
  })
  async findAllContacts(
    @Req() req: ExpressRequest,
    @Param('organizationId') organizationId: string,
  ): Promise<{ postsWithConverts: any, postsWithoutConverts: PostReadDto[] }> {
    // console.log('--- /contacts START ---');
      const start = Date.now();
    const user = req.user as ReadUserDto;
    const userPostsIds = user.posts.map((post) => post.id);

    // console.time('findAllContacts -> SQL: findAllContactsInOrganizationForCurrentUser + findAllWithUserForOrganization');

    const [postsWithConverts, postsWithoutConverts] = await Promise.all([
      this.postService.findAllContactsInOrganizationForCurrentUser(organizationId, userPostsIds),
      this.postService.findAllWithUserForOrganization(organizationId, user.id, ['user']),
    ]);
    // const postsWithConverts = await this.postService.findAllContactsInOrganizationForCurrentUser(organizationId, userPostsIds);
    // const postsWithConvertsIds: string[] = postsWithConverts.map(post => post.id)
    // const postsWithoutConverts = await this.postService.findAllWithoutConvertForOrganization(organizationId, postsWithConvertsIds, ['user'])

    // console.timeEnd('findAllContacts -> SQL: findAllContactsInOrganizationForCurrentUser + findAllWithUserForOrganization');
    const postsWithConvertsIds: string[] = postsWithConverts.map(post => post.id);
    const filteredPostsWithoutConverts = postsWithoutConverts.filter(
      post => !postsWithConvertsIds.includes(post.id)
    );
      // console.time('findAllContacts -> LOOP hasUnreadOrUnrepliedMessages');

      // Получаем все id контактов (postsWithConverts уже есть)
      const contactPostIds = postsWithConverts.map(p => p.id);

      // Один запрос к БД, который вернёт map contactPostId -> boolean
      const unreadMap = await this.postService.hasUnreadOrUnrepliedMessagesForMany(contactPostIds, userPostsIds);

      // Собираем итоговый массив
      const contactsWithStatus = postsWithConverts.map(post => ({
        ...post,
        hasUnrepliedMessage: !!unreadMap[post.id],
      }));


   // console.log('CONTACTS WITH STATUS:', contactsWithStatus);
    // const c = new Date();
    // const end = c.getTime() - start.getTime();
    // console.log(`все контакты ${end}`);

    // console.timeEnd('findAllContacts -> LOOP hasUnreadOrUnrepliedMessages');

  // console.log('TOTAL /contacts duration:', Date.now() - start, 'ms');
    return {
      postsWithConverts: contactsWithStatus,
      postsWithoutConverts: filteredPostsWithoutConverts,
    };
  }

  @Get(':organizationId/contactsFromAllOrganizations')
  @UseGuards(PermissionsGuard)
  @ModuleAccess(Modules.POST)
  @ActionAccess(Actions.READ)
  @ApiOperation({ summary: 'Все Контакты из разных организаций' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: findAllContactsExample,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Вы не авторизованы!',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiParam({
    name: 'organizationId',
    required: true,
    description: 'Id организации',
    example: 'bdb6b98b-d036-4878-bb3d-e4b1271aae89',
  })
  async findExtendedContacts(
    @Req() req: ExpressRequest,
    @Param('organizationId') organizationId: string,
  ) {
    const user = req.user as ReadUserDto;
    const myPostIds = user.posts.map(p => p.id);

    const [
      innerContactsWithConverts,
      innerContactsWithoutConverts,
      externalContacts,
    ] = await Promise.all([
      this.postService.findAllContactsInOrganizationForCurrentUser(organizationId, myPostIds),
      this.postService.findAllWithUserForOrganization(organizationId, user.id, ['user']),
      this.postService.findContactsFromOtherOrganizations(myPostIds, organizationId),
    ]);

    // убрать внутренние контакты с конвертами из списка без конвертов
    const innerConvertIds = innerContactsWithConverts.map(c => c.id);
    const filteredInnerWithoutConverts = innerContactsWithoutConverts.filter(
      post => !innerConvertIds.includes(post.id),
    );

    return {
      organizationContacts: {
        withConverts: innerContactsWithConverts,
        withoutConverts: filteredInnerWithoutConverts,
      },
      externalContacts,
    };
  }

  @Get(':organizationId')
  @UseGuards(PermissionsGuard)
  @ModuleAccess(Modules.POST)
  @ActionAccess(Actions.READ)
  @ApiOperation({ summary: 'Все посты в организации' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: findAllPostsExample,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Вы не авторизованы!',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiParam({
    name: 'organizationId',
    required: true,
    description: 'Id организации',
    example: '2d1cea4c-7cea-4811-8cd5-078da7f20167',
  })
  @ApiQuery({
    name: 'structure',
    required: false,
    description: 'Флаг для структуры организации',
    example: true,
  })
  async findAll(
    @Query('structure') structure: boolean,
    @Query('isArchive') isArchive: boolean,
    @Param('organizationId') organizationId: string,
  ): Promise<PostReadDto[]> {
    if (!structure) structure = false;
    if (!isArchive) isArchive = false;
    const posts = await this.postService.findAllForOrganization(
      organizationId,
      structure,
      isArchive,
      ['user'],
    );
    return posts;
  }

  @Patch(':postId/update')
  @UseGuards(PermissionsGuard)
  @ModuleAccess(Modules.POST)
  @ActionAccess(Actions.UPDATE)
  @ApiOperation({ summary: 'Обновить пост по Id' })
  @ApiBody({
    description: 'ДТО для обновления поста',
    type: PostUpdateDto,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: {
      id: '7730b6c2-c037-4c45-9dcc-603d7035d6a3',
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Ошибка валидации!',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Вы не авторизованы!',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: `Пост не найден!`,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiParam({ name: 'postId', required: true, description: 'Id поста' })
  async update(
    @Req() req: ExpressRequest,
    @Param('postId') postId: string,
    @Body() postUpdateDto: PostUpdateDto,
  ): Promise<{ id: string }> {
    const user = req.user as ReadUserDto;

    const promises: Promise<void>[] = [];

    if (postUpdateDto.policyId !== null) {
      promises.push(
        this.policyService
          .findOneById(postUpdateDto.policyId, false)
          .then((policy) => {
            postUpdateDto.policy = policy;
          }),
      );
    }

    if (postUpdateDto.responsibleUserId != null) {
      promises.push(
        this.userService
          .findOne(postUpdateDto.responsibleUserId)
          .then((user) => {
            postUpdateDto.user = user;
          }),
      );
    }

    if (postUpdateDto.roleId !== null) {
      promises.push(
        this.roleService
          .findOneById(postUpdateDto.roleId)
          .then((role) => {
            postUpdateDto.role = role;
          }),
      );
    }

    await Promise.all(promises);

    const updatedPostId = await this.postService.update(postId, postUpdateDto);
    if (postUpdateDto.responsibleUserId) {
      const updatedPost = await this.postService.findOneById(updatedPostId);
      const historyUsersToPostCreateDto: HistoryUsersToPostCreateDto = {
        user: postUpdateDto.user,
        post: updatedPost,
      };
      this.historyUsersToPostService
        .create(historyUsersToPostCreateDto)
        .catch((err) => {
          console.log(err);
          this.logger.error(`Ошибка при создании истории!`);
        });
    }
    // const updatedEventPostDto: PostUpdateEventDto = {
    //   eventType: 'POST_UPDATED',
    //   id: updatedPostId,
    //   postName:
    //     postUpdateDto.postName !== undefined ? postUpdateDto.postName : null,
    //   divisionName:
    //     postUpdateDto.divisionName !== undefined
    //       ? postUpdateDto.divisionName
    //       : null,
    //   parentId:
    //     postUpdateDto.parentId !== undefined ? postUpdateDto.parentId : null,
    //   product:
    //     postUpdateDto.product !== undefined ? postUpdateDto.product : null,
    //   purpose:
    //     postUpdateDto.purpose !== undefined ? postUpdateDto.purpose : null,
    //   updatedAt: new Date(),
    //   policyId:
    //     postUpdateDto.policyId !== undefined ? postUpdateDto.policyId : null,
    //   responsibleUserId:
    //     postUpdateDto.responsibleUserId !== undefined
    //       ? postUpdateDto.responsibleUserId
    //       : null,
    //   accountId: user.account.id,
    // };
    // try {
    //   await Promise.race([
    //     this.producerService.sendUpdatedPostToQueue(updatedEventPostDto),
    //     new Promise((_, reject) =>
    //       setTimeout(() => reject(new TimeoutError()), 5000),
    //     ),
    //   ]);
    // } catch (error) {
    //   if (error instanceof TimeoutError) {
    //     this.logger.error(
    //       `Ошибка отправки в RabbitMQ: превышено время ожидания - ${error.message}`,
    //     );
    //   } else {
    //     this.logger.error(`Ошибка отправки в RabbitMQ: ${error.message}`);
    //   }
    // }
    this.logger.info(
      `${yellow('OK!')} - UPDATED POST: ${JSON.stringify(postUpdateDto)} - Пост успешно обновлен!`,
    );
    return { id: updatedPostId };
  }

     @Get(':organizationId/new')
    @UseGuards(PermissionsGuard)
    @ModuleAccess(Modules.POST)
    @ActionAccess(Actions.READ)
    @ApiOperation({ summary: 'Получить данные для создания поста' })
    @ApiResponse({
      status: HttpStatus.OK,
      description: 'ОК!',
      example: beforeCreateExample,
    })
    @ApiResponse({
      status: HttpStatus.UNAUTHORIZED,
      description: 'Вы не авторизованы!',
    })
    @ApiResponse({
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      description: 'Ошибка сервера!',
    })
    @ApiParam({
      name: 'organizationId',
      required: true,
      description: 'Id организации',
      example: '2d1cea4c-7cea-4811-8cd5-078da7f20167',
    })
    async beforeCreate(
      @Param('organizationId') organizationId: string
    ): Promise<{
      workers: ReadUserDto[];
      policies: PolicyReadDto[];
      posts: PostReadDto[];
      roles: RoleReadDto[];
      maxDivisionNumber: number;
    }> {
      const organization = await this.organizationService.findOneById(
        organizationId,
        ['account'],
      );
      const account = organization.account;
      console.log('ORGANIZATION ACCOUNT:', organization.account);


      const [policies, workers, posts, roles, maxDivisionNumber] =
        await Promise.all([
          this.policyService.findAllActiveForOrganization(organizationId),
          this.userService.findAllForAccount(account),
          this.postService.findAllForOrganization(organizationId, false, false),
          this.roleService.findAll(),
          this.postService.findMaxDivisionNumber(organizationId),
        ]);

      return {
        workers,
        policies,
        posts,
        roles,
        maxDivisionNumber,
      };
    }


  @Get(':postId/post')
  @UseGuards(PermissionsGuard)
  @ModuleAccess(Modules.POST)
  @ActionAccess(Actions.READ)
  @ApiOperation({ summary: 'Получить пост по id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: findOnePostExample,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Вы не авторизованы!',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Пост не найден!',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiParam({
    name: 'postId',
    required: true,
    description: 'Id поста',
  })
  async findOne(@Param('postId') postId: string): Promise<{
    currentPost: PostReadDto;
    posts: PostReadDto[];
    parentPost: PostReadDto;
    workers: ReadUserDto[];
    policiesActive: PolicyReadDto[];
    roles: RoleReadDto[];
  }> {
    const currentPost = await this.postService.findOneById(postId, [
      'policy',
      'user',
      'organization',
      'organization.account',
      'statistics',
      'role'
    ]);
    const organizationId = currentPost.organization.id;
    const account = currentPost.organization.account;

    const isHasBoss = currentPost.parentId !== null ? true : false;
    const [posts, workers, policiesActive, roles] = await Promise.all([
      isHasBoss
        ? this.postService.getParentPosts(currentPost.id)
        : this.postService.findAllForOrganization(
          currentPost.organization.id,
          false,
          false,
          ['user'],
        ),
      this.userService.findAllForAccount(account, ['posts', 'posts.organization']),
      this.policyService.findAllActiveForOrganization(
        currentPost.organization.id,
      ),
      this.roleService.findAll(),
    ]);
    const _posts = posts.filter((post) => post.id !== currentPost.id);
    const parentPost = posts.find((post) => post.id === currentPost.parentId);
    const isHasChildPost = posts.some(
      (post) => post.parentId === currentPost.id,
    );
    const _currentPost = { ...currentPost, isHasChildPost };
    return {
      currentPost: _currentPost,
      posts: _posts,
      parentPost: parentPost,
      workers: workers,
      policiesActive: policiesActive,
      roles: roles,
    };
  }

  @Get(':postId/allUnderPosts')
  @UseGuards(PermissionsGuard)
  @ModuleAccess(Modules.POST)
  @ActionAccess(Actions.READ)
  @ApiOperation({ summary: 'Получить все дочерние посты' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: findAllUnderPostsExample,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Вы не авторизованы!',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiParam({
    name: 'postId',
    required: true,
    description: 'Id поста',
  })
  async findAllUnderPosts(
    @Param('postId') postId: string,
  ): Promise<PostReadDto[]> {
    const underPosts = await this.postService.getChildrenPosts(postId);
    return underPosts;
  }

  @Post('new')
  @UseGuards(PermissionsGuard)
  @ModuleAccess(Modules.POST)
  @ActionAccess(Actions.CREATE)
  @ApiOperation({ summary: 'Создать пост' })
  @ApiBody({
    description: 'ДТО для создания поста',
    type: PostCreateDto,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'CREATED!',
    example: { id: '2420fabb-3e37-445f-87e6-652bfd5a050c' },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Ошибка валидации!',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Вы не авторизованы!',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiQuery({
    name: 'addPolicyId',
    required: false,
    description: 'Id политики',
    example: 'null',
  })
  async create(
    @Req() req: ExpressRequest,
    @Body() postCreateDto: PostCreateDto,
  ): Promise<{ id: string }> {
  try {
    const user = req.user as ReadUserDto;
    const promises: Promise<void>[] = [];

    if (postCreateDto.policyId) {
      promises.push(
        this.policyService
          .findOneById(postCreateDto.policyId, false)
          .then((policy) => {
            postCreateDto.policy = policy;
          }),
      );
    }

    if (postCreateDto.responsibleUserId) {
      promises.push(
        this.userService
          .findOne(postCreateDto.responsibleUserId, ['posts'])
          .then((user) => {
            postCreateDto.user = user;
          }),
      );
    } else {
      postCreateDto.user = null;
    }


    promises.push(
      this.organizationService
        .findOneById(postCreateDto.organizationId)
        .then((organization) => {
          postCreateDto.organization = organization;
        }),
      this.roleService.findOneById(postCreateDto.roleId).then((role) => {
        postCreateDto.role = role;
      }),
    );

    await Promise.all(promises);

    postCreateDto.account = user.account;
    const createdPostId = await this.postService.create(postCreateDto);
    if (postCreateDto.responsibleUserId) {
      const createdPost = await this.postService.findOneById(createdPostId);
      const historyUsersToPostCreateDto: HistoryUsersToPostCreateDto = {
        user: postCreateDto.user,
        post: createdPost,
      };
      await this.historyUsersToPostService.create(historyUsersToPostCreateDto);
    }

    // if (postCreateDto.divisionName && postCreateDto.responsibleUserId) {
    //   const groups = await this.groupService.findAllByDivisionName(postCreateDto.divisionName); ЕСЛИ В ОТДЕЛЕ ОТДЕЛ, ТО КАК ЕГО ОБНОВЛЯТЬ
    //   const groupToUsersId = groups.flatMap(group =>
    //     group.groupToUsers.map(groupToUser => groupToUser.user.id)
    //   );
    //   groupToUsersId.push(postCreateDto.responsibleUserId);
    //   const groupUpdateDto: GroupUpdateDto = {
    //     groupToUsers: groupToUsersId
    //   }

    // }
    const normalize = (value: any) =>
    value === undefined || value === '' ? null : value;

    const createdEventPostDto: PostCreateEventDto = {
      eventType: 'POST_CREATED',
      id: createdPostId,
      postName: postCreateDto.postName,
      divisionName: normalize(postCreateDto.divisionName),
      parentId: normalize(postCreateDto.parentId),
      product: normalize(postCreateDto.product),
      purpose: normalize(postCreateDto.purpose),
      createdAt: new Date(),
      policyId: normalize(postCreateDto.policyId),
      accountId: user.account.id,
      responsibleUserId: normalize(postCreateDto.responsibleUserId),
      organizationId: normalize(postCreateDto.organizationId),
    };

    // try {
    //   await Promise.race([
    //     this.producerService.sendCreatedPostToQueue(createdEventPostDto),
    //     new Promise((_, reject) =>
    //       setTimeout(() => reject(new TimeoutError()), 5000),
    //     ),
    //   ]);
    // } catch (error) {
    //   if (error instanceof TimeoutError) {
    //     this.logger.error(
    //       `Ошибка отправки в RabbitMQ: превышено время ожидания - ${error.message}`,
    //     );
    //   } else {
    //     this.logger.error(`Ошибка отправки в RabbitMQ: ${error.message}`);
    //   }
    // }
    this.logger.info(
      `${yellow('OK!')} - postCreateDto: ${JSON.stringify(postCreateDto)} - Создан новый пост!`,
    );
    return { id: createdPostId };
  }
  catch (error) {
    this.logger.error(`Ошибка в контроллере при создании поста: ${error.message}`);
    throw error;
  }
}

  @Patch(':postId/changeDefaultPost')
  @UseGuards(PermissionsGuard)
  @ModuleAccess(Modules.POST)
  @ActionAccess(Actions.UPDATE)
  @ApiOperation({ summary: 'Сменить дефолтный пост для себя' })
  @ApiBody({
    description: 'ДТО для обновления поста',
    type: PostUpdateDefaultDto,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: {
      id: '7730b6c2-c037-4c45-9dcc-603d7035d6a3',
    },
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Ошибка валидации!',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Вы не авторизованы!',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: `Пост не найден!`,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiParam({ name: 'postId', required: true, description: 'Id поста' })
  async updateDefaultPost(
    @Param('postId') postId: string,
    @Body() postUpdateDefaultDto: PostUpdateDefaultDto,
  ): Promise<{ id: string }> {
    const updatedPostId = await this.postService.updateDefaultPost(
      postId,
      postUpdateDefaultDto,
    );
    this.logger.info(
      `${yellow('OK!')} - UPDATED POST: ${JSON.stringify(postUpdateDefaultDto)} - Пост успешно обновлен!`,
    );
    return { id: updatedPostId };
  }
}