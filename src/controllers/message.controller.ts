import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
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
import { Logger } from 'winston';
import { yellow } from 'colorette';
import { AccessTokenGuard } from 'src/guards/accessToken.guard';
import { MessageService } from 'src/application/services/message/message.service';
import { MessageReadDto } from 'src/contracts/message/read-message.dto';
import {
  findSeenMessagesForConvertExample,
  findUnseenMessagesForConvertExample,
} from 'src/constants/swagger-examples/message/message-example';
import { CustomParseIntPipe } from 'src/validators/pipes/customParseIntPipe';
import { Request as ExpressRequest } from 'express';
import { MessageCreateDto } from 'src/contracts/message/create-message.dto';
import { ReadUserDto } from 'src/contracts/user/read-user.dto';
import { ConvertService } from 'src/application/services/convert/convert.service';
import { ConvertGateway } from 'src/gateways/convert.gateway';
import { MessagesGuard } from 'src/guards/message.guard';
import { WatchersToConvertService } from 'src/application/services/watchersToConvert/watchersToConvert.service';
import { PostService } from 'src/application/services/post/post.service';

@ApiTags('Messages')
@ApiBearerAuth('access-token')
@UseGuards(AccessTokenGuard)
@Controller('messages')
export class MessageController {
  constructor(
    private readonly messageService: MessageService,
    private readonly convertService: ConvertService,
    private readonly watcherToConvertService: WatchersToConvertService,
    private readonly postService: PostService,
    private readonly convertGateway: ConvertGateway,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  @Get(':convertId/watcher/seen')
  @ApiOperation({
    summary:
      'Прочитанные сообщения ДЛЯ НАБЛЮДАТЕЛЯ в чате с пагинацией (отсортированы по createdAt DESC)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: findSeenMessagesForConvertExample,
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
  @ApiQuery({
    name: 'pagination',
    required: false,
    description: 'Отступ пагинации',
    example: 120,
  })
  async findSeenForWatcherForConvert(
    @Req() req: ExpressRequest,
    @Param('convertId') convertId: string,
    @Query('pagination', CustomParseIntPipe) pagination: number,
  ): Promise<MessageReadDto[]> {
    const start = new Date();
    const user = req.user as ReadUserDto;
    const userPostIds = user.posts.map((post) => post.id);
    const messages = await this.messageService.findSeenForWatcherForConvert(
      convertId,
      pagination,
      userPostIds,
    );
    const now = new Date();
    console.log(`прочитанные наблюдатель ${now.getTime() - start.getTime()}`);
    return messages;
  }

  @Get(':convertId/watcher/unseen')
  @ApiOperation({
    summary:
      'Непрочитанные сообщения ДЛЯ НАБЛЮДАТЕЛЯ в чате с пагинацией (отсортированы по createdAt DESC)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: findSeenMessagesForConvertExample,
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
  async findUnseenForWatcherForConvert(
    @Req() req: ExpressRequest,
    @Param('convertId') convertId: string,
  ): Promise<MessageReadDto[]> {
    const start = new Date();
    const user = req.user as ReadUserDto;
    const userPostIds = user.posts.map((post) => post.id);
    const messages = await this.messageService.findUnseenForWatcherForConvert(
      convertId,
      userPostIds,
    );
    const now = new Date();
    console.log(`непрочитанные наблюдатель ${now.getTime() - start.getTime()}`);
    return messages;
  }

  @Get(':convertId/seen')
  @ApiOperation({
    summary:
      'Прочитанные сообщения и сообщения юзера в чате с пагинацией (отсортированы по createdAt DESC)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: findSeenMessagesForConvertExample,
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
  @ApiQuery({
    name: 'pagination',
    required: false,
    description: 'Отступ пагинации',
    example: 120,
  })
  async findSeenForConvert(
    @Req() req: ExpressRequest,
    @Param('convertId') convertId: string,
    @Query('pagination', CustomParseIntPipe) pagination: number,
  ): Promise<MessageReadDto[]> {
    const start = new Date();
    const user = req.user as ReadUserDto;
    const userPostIds = user.posts.map((post) => post.id);
    const messages = await this.messageService.findSeenForConvert(
      convertId,
      pagination,
      userPostIds,
    );
    const now = new Date();
    console.log(`прочитанные ${now.getTime() - start.getTime()}`);
    return messages;
  }

  @Get(':convertId/unseen')
  @ApiOperation({
    summary:
      'Непрочитанные сообщения в чате с пагинацией (отсортированы по createdAt DESC)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: findUnseenMessagesForConvertExample,
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
  async findUnseenForConvert(
    @Req() req: ExpressRequest,
    @Param('convertId') convertId: string,
  ): Promise<MessageReadDto[]> {
    const start = new Date();
    const user = req.user as ReadUserDto;
    const userPostIds = user.posts.map((post) => post.id);
    const messages = await this.messageService.findUnseenForConvert(
      convertId,
      userPostIds,
    );
    const now = new Date();
    console.log(`непрочитанные ${now.getTime() - start.getTime()}`);
    return messages;
  }

  @Post(':convertId/sendMessage')
  @UseGuards(MessagesGuard)
  @ApiOperation({ summary: 'Отправить сообщение' })
  @ApiBody({
    description: 'ДТО для создания сообщения',
    type: MessageCreateDto,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'ОК!',
    example: {
      id: '27b360b3-7caf-48bd-a91a-5f7adef327de',
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
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  async sendMessage(
    @Req() req: ExpressRequest,
    @Param('convertId') convertId: string,
    @Body() messageCreateDto: MessageCreateDto,
  ): Promise<{ id: string }> {
    const start = new Date();
    const user = req.user as ReadUserDto;
    const userSenderPost = user.posts.find(
      (post) => post.id === messageCreateDto.postId,
    );
    const convert = await this.convertService.findOneById(convertId, [
      'convertToPosts.post.user',
      'watchersToConvert.post.user',
      'host.user',
    ]);
    const watcherUsersIdsInConvert = convert.watchersToConvert.map(
      (watcherToConvert) => {
        if (watcherToConvert.post.id !== userSenderPost.id)
          return watcherToConvert.post.user.id;
      },
    );
    const userIdsInConvert = convert.convertToPosts
      .map((convertToPost) => {
        if (convertToPost.post.user && convertToPost.post.user.id !== user.id)
          return convertToPost.post.user.id;
      })
      .concat(watcherUsersIdsInConvert);

    messageCreateDto.convert = convert;
    messageCreateDto.sender = userSenderPost;
    const createdMessageId = await this.messageService.create(messageCreateDto);
    const [messageWithAttachments, lastPostInConvert] = await Promise.all([
      this.messageService.findOne(createdMessageId, [
        'attachmentToMessages.attachment',
        'sender.user',
      ]),
      this.postService.findOneById(
        convert.pathOfPosts[convert.pathOfPosts.length - 1],
        ['user'],
      ),
    ]);
    const watcherIds = convert.watchersToConvert.map((watcher) => watcher.id);
    if (watcherIds.length > 0) {
      await this.watcherToConvertService.updateWatchersCount(watcherIds);
    }
    this.convertGateway.handleMessageCreationEvent(
      convertId,
      messageWithAttachments,
    );
    this.convertGateway.handleMessageCountEvent(
      convertId,
      userIdsInConvert,
      convert.host,
      lastPostInConvert,
    );
    this.logger.info(
      `${yellow('OK!')} - messageCreateDto: ${JSON.stringify(messageCreateDto)} - Создано новое сообщение!`,
    );
    const now = new Date();
    console.log(now.getTime() - start.getTime());
    return { id: createdMessageId };
  }
}
