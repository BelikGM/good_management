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
import { ConvertService } from 'src/application/services/convert/convert.service';
import { ConvertCreateDto } from 'src/contracts/convert/create-convert.dto';
import { ConvertReadDto } from 'src/contracts/convert/read-convert.dto';
import { Logger } from 'winston';
import { yellow } from 'colorette';
import { PostService } from 'src/application/services/post/post.service';
import { ConvertGateway } from 'src/gateways/convert.gateway';
import { PathConvert, TypeConvert } from 'src/domains/convert.entity';
import { AccessTokenGuard } from 'src/guards/accessToken.guard';
import { Request as ExpressRequest } from 'express';
import { ReadUserDto } from 'src/contracts/user/read-user.dto';
import { ConvertUpdateDto } from 'src/contracts/convert/update-convert.dto';
import {
  findAllForContact,
  findOneConvertExample,
} from 'src/constants/swagger-examples/convert/convert-examples';
import { GetConvertGuard } from 'src/guards/getConvert.guard';
import { FinishConvertGuard } from 'src/guards/finishConvert.guard';
import { ApproveConvertGuard } from 'src/guards/approveConvert.guard';
import { PostReadDto } from 'src/contracts/post/read-post.dto';
import { ConvertFinishDto } from 'src/contracts/convert/finish-convert.dto';
import { createPathFromSenderToRecieverPost } from 'src/helpersFunc/createPathFromSenderToRecieverPost';

@ApiTags('Converts')
@ApiBearerAuth('access-token')
@UseGuards(AccessTokenGuard)
@Controller('converts')
export class ConvertController {
  constructor(
    private readonly convertService: ConvertService,
    private readonly postService: PostService,
    private readonly convertGateway: ConvertGateway,
    @Inject('winston') private readonly logger: Logger,
  ) { }

  @Get(':contactId/converts/archive')
  @ApiOperation({ summary: 'Все архивные конверты' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: findAllForContact,
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
    name: 'contactId',
    required: true,
    description: 'Id контакта (поста)',
    example: '5fc5ec49-d658-4fe1-b4c9-7dd01d38a652',
  })
  @ApiQuery({
    name: 'pagination',
    required: false,
    description: 'Отступ пагинации',
    example: 20,
  })
  async findAllArchiveForContact(
    @Req() req: ExpressRequest,
    @Param('contactId') contactId: string,
    @Query('pagination') pagination: number,
  ): Promise<any> {
    const start = new Date();
    const user = req.user as ReadUserDto;
    const userPostsIds = user.posts.map((post) => post.id);
    const [archiveConvertsForContact, archiveCopiesForContact] =
      await Promise.all([
        this.convertService.findAllArchiveForContact(userPostsIds, contactId, pagination),
        this.convertService.findAllArchiveCopiesForContact(
          userPostsIds,
          contactId,
          pagination
        ),
      ]);
    const c = new Date();
    const end = c.getTime() - start.getTime();
    console.log(`чаты ${end}`);
    return {
      archiveConvertsForContact: archiveConvertsForContact,
      archiveCopiesForContact: archiveCopiesForContact,
    };
  }

  @Get(':contactId/converts')
  @ApiOperation({ summary: 'Все конверты' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: findAllForContact,
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
    name: 'contactId',
    required: true,
    description: 'Id контакта (поста)',
    example: '5fc5ec49-d658-4fe1-b4c9-7dd01d38a652',
  })
  @ApiQuery({
    name: 'pagination',
    required: false,
    description: 'Отступ пагинации',
    example: 20,
  })
  async findAllForContact(
    @Req() req: ExpressRequest,
    @Param('contactId') contactId: string,
  ): Promise<{
    contact: PostReadDto;
    convertsForContact: any[];
    copiesForContact: any[];
  }> {
    const start = new Date();
    const user = req.user as ReadUserDto;
    const userPostsIds = user.posts.map((post) => post.id);
    const [contact, convertsForContact, copiesForContact] = await Promise.all([
      this.postService.findOneById(contactId, ['user']),
      this.convertService.findAllForContact(userPostsIds, contactId),
      this.convertService.findAllCopiesForContact(userPostsIds, contactId),
    ]);
    const c = new Date();
    const end = c.getTime() - start.getTime();
    console.log(`чаты ${end}`);
    return {
      contact: contact,
      convertsForContact: convertsForContact,
      copiesForContact: copiesForContact,
    };
  }

  @Get(':convertId')
  @UseGuards(GetConvertGuard)
  @ApiOperation({ summary: 'Конверт по id' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: findOneConvertExample,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Вы не авторизованы!',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: `У вас нет доступа к этому чату!`,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: `Конверт не найден!`,
  })
  @ApiParam({
    name: 'convertId',
    required: true,
    description: 'Id конверта',
    example: 'bdebb8ec-2a05-477c-93a8-463f60f3d2b5',
  })
  async findOne(
    @Param('convertId') convertId: string,
  ): Promise<{ convert: ConvertReadDto; allPostsInConvert: PostReadDto[] }> {
    const start = new Date();
    const convert = await this.convertService.findOneById(convertId, [
      'convertToPosts.post.user',
      'host.user.organization',
      'watchersToConvert.post.user',
      'target',
    ]);
    const allPostsInConvert = await this.postService.findBulk(
      convert.pathOfPosts,
      ['user'],
    );
    const now = new Date();
    console.log(`чат по id ${now.getTime() - start.getTime()}`);
    return { convert: convert, allPostsInConvert: allPostsInConvert };
  }

  @Post('new')
  @ApiOperation({ summary: 'Создать конверт' })
  @ApiBody({
    description: 'ДТО для создания конверта',
    type: ConvertCreateDto,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'CREATED!',
    example: {
      id: '27b360b3-7caf-48bd-a91a-5f7adef327de',
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Вы не авторизованы!',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  async create(
    @Req() req: ExpressRequest,
    @Body() convertCreateDto: ConvertCreateDto,
  ): Promise<{ id: string }> {
    const user = req.user as ReadUserDto;
    const userPost = user.posts.find(
      (post) => post.id === convertCreateDto.senderPostId,
    );
    const isChat = convertCreateDto.convertType === TypeConvert.CHAT;
    const [postIdsFromSenderToTop, postIdsFromRecieverToTop, targetHolderPost] =
      await Promise.all([
        isChat
          ? []
          : this.postService.getHierarchyToTop(convertCreateDto.senderPostId),
        isChat
          ? []
          : this.postService.getHierarchyToTop(convertCreateDto.reciverPostId),
        this.postService.findOneById(convertCreateDto.reciverPostId),
      ]);
    const isCommonDivision = createPathFromSenderToRecieverPost(
      postIdsFromSenderToTop,
      postIdsFromRecieverToTop,
    ).isCommonDivision;
    const postIdsFromSenderToReciver = createPathFromSenderToRecieverPost(
      postIdsFromSenderToTop,
      postIdsFromRecieverToTop,
    ).postIdsFromSenderToReciver;
    console.log(postIdsFromSenderToTop); // ___________________________LOG
    console.log(postIdsFromRecieverToTop); // ___________________________LOG
    console.log(postIdsFromSenderToReciver); // ___________________________LOG
    if (!isCommonDivision && !isChat) {
      convertCreateDto.convertPath = PathConvert.REQUEST;
    } else if (postIdsFromSenderToReciver.length > 2 && !isChat) {
      convertCreateDto.convertPath = PathConvert.COORDINATION;
    } else {
      convertCreateDto.convertPath = PathConvert.DIRECT;
    }

    convertCreateDto.pathOfPosts = isChat
      ? [convertCreateDto.senderPostId, convertCreateDto.reciverPostId]
      : postIdsFromSenderToReciver;
    convertCreateDto.host = userPost;
    convertCreateDto.account = user.account;
    if (convertCreateDto.convertType === TypeConvert.ORDER) {
      convertCreateDto.targetCreateDto.holderPost = targetHolderPost;
    }

    const [createdConvert, activePost] = await Promise.all([
      this.convertService.create(convertCreateDto),
      this.postService.findOneById(convertCreateDto.pathOfPosts[1], ['user']),
    ]);

    // Если у поста есть юзер, то прокидывать сокет
    if (activePost.user !== null) {
      const index = createdConvert.pathOfPosts.indexOf(userPost.id);
      const pathOfPostsWithoutHostPost = createdConvert.pathOfPosts.splice(
        index,
        1,
      );
      createdConvert.host.user = user;
      createdConvert.host.user.posts = null;
      this.convertGateway.handleConvertCreationEvent(
        createdConvert.id,
        createdConvert.host,
        activePost,
        pathOfPostsWithoutHostPost,
      );
    }
    this.logger.info(
      `${yellow('OK!')} - convertCreateDto: ${JSON.stringify(convertCreateDto)} - Создан новый конверт!`,
    );
    return { id: createdConvert.id };
  }

  @Patch(':convertId/approve') // в guard проверку на host.user.id и что activePostId не последний в массиве
  @UseGuards(ApproveConvertGuard)
  @ApiOperation({
    summary: 'Продолжить конверт (аппрувнуть) его по pathOfPosts',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: {
      id: '27b360b3-7caf-48bd-a91a-5f7adef327de',
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Вы не авторизованы!',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Вы не можете одобрить данный конверт!',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiParam({
    name: 'convertId',
    required: true,
    description: 'Id конверта',
    example: 'bdebb8ec-2a05-477c-93a8-463f60f3d2b5',
  })
  async approve(@Param('convertId') convertId: string): Promise<string> {
    const convert = await this.convertService.findOneById(convertId, [
      'convertToPosts.post',
    ]);
    const postsInConvertIds = convert.convertToPosts.map(
      (convertToPost) => convertToPost.post.id,
    );
    const indexOfActivePostId = convert.pathOfPosts.indexOf(
      convert.activePostId,
    );
    const nextPost = await this.postService.findOneById(
      convert.pathOfPosts[indexOfActivePostId + 1],
    );
    const newConvertToPostIds = postsInConvertIds.concat(nextPost.id);
    const convertUpdateDto: ConvertUpdateDto = {
      _id: convert.id,
      activePostId: convert.pathOfPosts[indexOfActivePostId + 1],
      convertToPostIds: newConvertToPostIds,
    };
    const approvedConvertId = await this.convertService.update(
      convertUpdateDto._id,
      convertUpdateDto,
    );
    const pathOfPostsWithoutHostPost = postsInConvertIds.splice(0, 1);
    this.convertGateway.handleConvertApproveEvent(
      approvedConvertId,
      nextPost,
      pathOfPostsWithoutHostPost,
    );
    this.logger.info(
      `${yellow('OK!')} - convertUpdateDto: ${JSON.stringify(convertUpdateDto)} - Конверт одобрен!`,
    );
    return approvedConvertId;
  }

  @Patch(':convertId/finish')
  @UseGuards(FinishConvertGuard)
  @ApiOperation({ summary: 'Завершить конверт' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: {
      id: '27b360b3-7caf-48bd-a91a-5f7adef327de',
    },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Вы не авторизованы!',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Вы не можете завершить данный конверт!',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiParam({
    name: 'convertId',
    required: true,
    description: 'Id конверта',
    example: 'bdebb8ec-2a05-477c-93a8-463f60f3d2b5',
  })
  async finish(
    @Param('convertId') convertId: string,
    @Body() convertFinishDto: ConvertFinishDto,
  ): Promise<{ id: string }> {
    const convertUpdateDto: ConvertUpdateDto = {
      _id: convertId,
      convertStatus: false,
    };
    const finishedConvertId = await this.convertService.update(
      convertUpdateDto._id,
      convertUpdateDto,
    );
    this.convertGateway.handleConvertFinishEvent(
      finishedConvertId,
      convertUpdateDto.convertStatus,
      convertFinishDto.pathOfUsers,
    );
    this.logger.info(
      `${yellow('OK!')} - convertUpdateDto: ${JSON.stringify(convertUpdateDto)} - Конверт завершен!`,
    );
    return { id: finishedConvertId };
  }

  @Patch(':convertId/update')
  @ApiOperation({ summary: 'Обновить конверт' })
  @ApiBody({
    description: 'ДТО для обновления конверта',
    type: ConvertUpdateDto,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: {
      id: '27b360b3-7caf-48bd-a91a-5f7adef327de',
    },
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
    name: 'convertId',
    required: true,
    description: 'Id конверта',
    example: 'bdebb8ec-2a05-477c-93a8-463f60f3d2b5',
  })
  async update(
    @Param('convertId') convertId: string,
    @Body() convertUpdateDto: ConvertUpdateDto,
  ): Promise<string> {
    const updatedConvertId = await this.convertService.update(
      convertUpdateDto._id,
      convertUpdateDto,
    );
    this.logger.info(
      `${yellow('OK!')} - convertUpdateDto: ${JSON.stringify(convertUpdateDto)} - Конверт обновлен!`,
    );
    return updatedConvertId;
  }
}
