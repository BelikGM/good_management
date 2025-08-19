import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';

import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { TargetService } from 'src/application/services/target/target.service';
import { TargetReadDto } from 'src/contracts/target/read-target.dto';
import { Logger } from 'winston';
import { Request as ExpressRequest } from 'express';
import { ReadUserDto } from 'src/contracts/user/read-user.dto';
import { AccessTokenGuard } from 'src/guards/accessToken.guard';
import { TargetCreateDto } from 'src/contracts/target/create-target.dto';
import { PostService } from 'src/application/services/post/post.service';
import { PostReadDto } from 'src/contracts/post/read-post.dto';
import { yellow } from 'colorette';
import { TargetUpdateDto } from 'src/contracts/target/update-target.dto';
import { PolicyService } from 'src/application/services/policy/policy.service';
import {
  findAllArchiveExample,
  findAllTargetsExample,
} from 'src/constants/swagger-examples/target/target-example';

@ApiBearerAuth('access-token')
@UseGuards(AccessTokenGuard)
@ApiTags('Targets')
@Controller('targets')
export class TargetController {
  constructor(
    private readonly targetService: TargetService,
    private readonly postService: PostService,
    private readonly policyService: PolicyService,
    @Inject('winston') private readonly logger: Logger,
  ) { }

  @Get()
  @ApiOperation({ summary: 'Личные задачи, задачи из проектов и приказы' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: findAllTargetsExample,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Вы не авторизованы!',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  async findAll(@Req() req: ExpressRequest): Promise<{
    userPosts: PostReadDto[];
    personalTargets: TargetReadDto[];
    ordersTargets: TargetReadDto[];
    projectTargets: TargetReadDto[];
    sendedTargets: TargetReadDto[];
  }> {
    const user = req.user as ReadUserDto;
    const userPosts = await this.postService.findAllForUser(user.id, [
      'organization',
    ]);
    const userPostsIds = userPosts.map((post) => post.id);
    const [personalTargets, orderTargets, projectTargets, sendedTargets] = await Promise.all([
      this.targetService.findAllPersonalForUserPosts(userPostsIds, false, [
        'policy',
        'attachmentToTargets.attachment',
      ]),
      this.targetService.findAllOrdersForUserPosts(userPostsIds, false, [
        'convert.host.user',
        'attachmentToTargets.attachment',
      ]),
      this.targetService.findAllFromProjectsForUserPosts(userPostsIds, false),
      this.targetService.findSendedTargets(userPostsIds, false, [
        'convert.host.user',
        'attachmentToTargets.attachment',
      ])
    ]);
    return {
      userPosts: userPosts,
      personalTargets: personalTargets,
      ordersTargets: orderTargets,
      projectTargets: projectTargets,
      sendedTargets: sendedTargets
    };
  }

  @Get('archive')
  @ApiOperation({ summary: 'Личные задачи, задачи из проектов и приказы' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: findAllArchiveExample,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Вы не авторизованы!',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  async findAllArchive(@Req() req: ExpressRequest): Promise<{
    userPosts: PostReadDto[];
    personalArchiveTargets: TargetReadDto[];
    ordersArchiveTargets: TargetReadDto[];
    projectArchiveTargets: TargetReadDto[];
  }> {
    const user = req.user as ReadUserDto;
    const userPosts = await this.postService.findAllForUser(user.id, [
      'organization',
    ]);
    const userPostsIds = userPosts.map((post) => post.id);
    const [personalArchiveTargets, orderArchiveTargets, projectArchiveTargets] =
      await Promise.all([
        this.targetService.findAllPersonalForUserPosts(userPostsIds, true, [
          'policy',
          'attachmentToTargets.attachment',
        ]),
        this.targetService.findAllOrdersForUserPosts(userPostsIds, true, [
          'convert.host.user',
          'attachmentToTargets.attachment',
        ]),
        this.targetService.findAllFromProjectsForUserPosts(userPostsIds, true),
        this.targetService.findSendedTargets(userPostsIds, true, [
          'convert.host.user',
          'attachmentToTargets.attachment',
        ])
      ]);
    return {
      userPosts: userPosts,
      personalArchiveTargets: personalArchiveTargets,
      ordersArchiveTargets: orderArchiveTargets,
      projectArchiveTargets: projectArchiveTargets,
    };
  }

  @Post('new')
  @ApiOperation({ summary: 'Создать личную задачу' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'CREATED!',
    example: {
      id: '614b9353-f432-4536-837f-a020249fd173',
    },
  })
  @ApiBody({
    description: 'ДТО для создания личной задачи',
    type: TargetCreateDto,
    required: true,
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
  async create(
    @Body() targetCreateDto: TargetCreateDto,
  ): Promise<{ id: string }> {
    const promises: Promise<void>[] = [];
    promises.push(
      this.postService
        .findOneById(targetCreateDto.holderPostId)
        .then((post) => {
          targetCreateDto.holderPost = post;
        }),
    );
    if (targetCreateDto.policyId) {
      promises.push(
        this.policyService
          .findOneById(targetCreateDto.policyId, false)
          .then((policy) => {
            targetCreateDto.policy = policy;
          }),
      );
    }
    await Promise.all(promises);
    const createdTarget = await this.targetService.create(targetCreateDto);
    this.logger.info(
      `${yellow('OK!')} - CREATED TARGET: ${JSON.stringify(targetCreateDto)} - Личная задача успешно создана!`,
    );
    return { id: createdTarget.id };
  }

  @Patch(':targetId/update')
  @ApiOperation({ summary: 'Обновить личную задачу по Id' })
  @ApiBody({
    description: 'ДТО для обновления задачи',
    type: TargetUpdateDto,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: { id: 'ed2dfe55-b678-4f7e-a82e-ccf395afae05' },
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
    description: `Задача не найдена!`,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiParam({ name: 'targetId', required: true, description: 'Id задачи' })
  async update(
    @Param('targetId') targetId: string,
    @Body() targetUpdateDto: TargetUpdateDto,
  ): Promise<{ id: string }> {
    const promises: Promise<void>[] = [];
    if (targetUpdateDto.holderPostId) {
      promises.push(
        this.postService
          .findOneById(targetUpdateDto.holderPostId)
          .then((post) => {
            targetUpdateDto.holderPost = post;
          }),
      );
    }
    if (targetUpdateDto.policyId != null) {
      promises.push(
        this.policyService
          .findOneById(targetUpdateDto.policyId, false)
          .then((policy) => {
            targetUpdateDto.policy = policy;
          }),
      );
    }
    const updatedTargetId = await this.targetService.update(targetUpdateDto);

    this.logger.info(
      `${yellow('OK!')} - targetUpdateDto: ${JSON.stringify(targetUpdateDto)} - Задача успешно обновлена!`,
    );
    return { id: updatedTargetId };
  }

  @Delete(':targetId/remove')
  @ApiOperation({ summary: 'Удалить личную задачу' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: { message: 'Личная задача успешно удалена!' },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Вы не авторизованы!',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Задача не найдена!',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiParam({
    name: 'targetId',
    required: true,
    description: 'Id личной задачи',
  })
  async remove(@Param('targetId') targetId: string) {
    await this.targetService.remove(targetId);
    return { message: 'Личная задача успешно удалена!' };
  }
}
