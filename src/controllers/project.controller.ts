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
import { ProjectService } from 'src/application/services/project/project.service';
import { StrategyService } from 'src/application/services/strategy/strategy.service';
import { TargetService } from 'src/application/services/target/target.service';
import { ProjectCreateDto } from 'src/contracts/project/create-project.dto';
import { ProjectReadDto } from 'src/contracts/project/read-project.dto';
import { Logger } from 'winston';
import { blue, red, green, yellow, bold } from 'colorette';
import { ReadUserDto } from 'src/contracts/user/read-user.dto';
import { OrganizationService } from 'src/application/services/organization/organization.service';
import { ProjectUpdateDto } from 'src/contracts/project/update-project.dto';
import { StrategyReadDto } from 'src/contracts/strategy/read-strategy.dto';
import { ProducerService } from 'src/application/services/producer/producer.service';
import { TimeoutError } from 'rxjs';
import { Request as ExpressRequest } from 'express';
import { AccessTokenGuard } from 'src/guards/accessToken.guard';
import { PostService } from 'src/application/services/post/post.service';
import { PostReadDto } from 'src/contracts/post/read-post.dto';
import {
  beforeCreate,
  beforeCreateProgram,
  findAllExample,
  findOneExample,
  findOneProgramExample,
} from 'src/constants/swagger-examples/projects/project-examples';
import {
  State,
  State as TargetState,
  Type as TargetType,
} from 'src/domains/target.entity';
import { ConvertCreateDto } from 'src/contracts/convert/create-convert.dto';
import { ConvertUpdateDto } from 'src/contracts/convert/update-convert.dto';
import { createPathFromSenderToRecieverPost } from 'src/helpersFunc/createPathFromSenderToRecieverPost';
import { setConvertPath } from 'src/helpersFunc/setConvertPath';
import { TypeConvert } from 'src/domains/convert.entity';

@ApiTags('Project')
@ApiBearerAuth('access-token')
@UseGuards(AccessTokenGuard)
@Controller('projects')
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly postService: PostService,
    private readonly strategyService: StrategyService,
    private readonly targetService: TargetService,
    private readonly organizationService: OrganizationService,
    private readonly producerService: ProducerService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  @Get(':organizationId/projects')
  @ApiOperation({ summary: 'Все проекты в организации' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: findAllExample,
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
  async findAll(
    @Param('organizationId') organizationId: string,
  ): Promise<ProjectReadDto[]> {
    return await this.projectService.findAllForOrganization(organizationId, [
      'targets',
    ]);
  }

  @Get(':organizationId/program/new')
  @ApiOperation({ summary: 'Получить данные для создания новой программы' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: beforeCreateProgram,
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
  async beforeCreateProgram(
    @Req() req: ExpressRequest,
    @Param('organizationId') organizationId: string,
  ): Promise<{
    posts: PostReadDto[];
    strategies: StrategyReadDto[];
    projects: ProjectReadDto[];
  }> {
    const user = req.user as ReadUserDto;
    const posts = await this.postService.findAllWithUserForOrganization(
      organizationId,
      user.id,
      ['user'],
    );
    const strategies =
      await this.strategyService.findAllActiveForOrganization(organizationId);
    const projects =
      await this.projectService.findAllProjectsWithoutProgramForOrganization(
        organizationId,
        ['targets'],
      );
    return {
      posts: posts,
      strategies: strategies,
      projects: projects,
    };
  }

  @Get(':organizationId/new')
  @ApiOperation({ summary: 'Получить данные для создания нового проекта' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: beforeCreate,
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
    @Req() req: ExpressRequest,
    @Param('organizationId') organizationId: string
  ): Promise<{
    posts: PostReadDto[];
    strategies: StrategyReadDto[];
    programs: ProjectReadDto[];
  }> {
    const user = req.user as ReadUserDto;
    const posts = await this.postService.findAllWithUserForOrganization(
      organizationId,
      user.id
      ['user'],
    );
    const strategies =
      await this.strategyService.findAllActiveForOrganization(organizationId);
    const programs = await this.projectService.findAllProgramsForOrganization(
      organizationId,
      ['strategy', 'targets'],
    );
    return {
      posts: posts,
      strategies: strategies,
      programs: programs,
    };
  }

  @Post('new')
  @ApiOperation({ summary: 'Создать проект' })
  @ApiBody({
    description: 'Данные для создания задач и проекта',
    type: ProjectCreateDto,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'ОК!',
    example: { id: 'ff6c48ae-8493-48cc-9c5d-cdd1393858e6' },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Вы не авторизованы!',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Ошибка валидации!',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  async create(
    @Req() req: ExpressRequest,
    @Body() projectCreateDto: ProjectCreateDto,
  ): Promise<{ id: string }> {
    const start = new Date();
    const user = req.user as ReadUserDto;
    const [organization, strategy] = await Promise.all([
      this.organizationService.findOneById(projectCreateDto.organizationId),
      projectCreateDto.strategyId !== undefined
        ? await this.strategyService.findOneById(projectCreateDto.strategyId)
        : undefined,
    ]);
    const postCreator = user.posts.find((post) => post.isDefault);
    projectCreateDto.postCreator = postCreator;
    projectCreateDto.account = user.account;
    projectCreateDto.organization = organization;
    projectCreateDto.strategy = strategy;
    const createdProjectId = await this.projectService.create(projectCreateDto);

    // const targetCreateEventDtos: TargetCreateEventDto[] = [];

    // if (projectCreateDto.targetCreateDtos !== undefined) {
    //   const createTargetsPromises = projectCreateDto.targetCreateDtos.map(
    //     async (targetCreateDto) => {
    //       const holderPost = await this.postService.findOneById(targetCreateDto.holderPostId);
    //       targetCreateDto.project = createdProject;
    //       targetCreateDto.holderPost = holderPost;
    //       const createdTarget = await this.targetService.create(targetCreateDto);
    //       const targetCreateEventDto: TargetCreateEventDto = {
    //         id: createdTarget.id,
    //         type: targetCreateDto.type ?? TypeTarget.COMMON, // TypeTarget alias for Type (target)
    //         orderNumber: targetCreateDto.orderNumber,
    //         content: targetCreateDto.content,
    //         createdAt: new Date(),
    //         holderPostId: targetCreateDto.holderPostId,
    //         targetState: State.ACTIVE as string,
    //         dateStart:
    //           targetCreateDto.dateStart !== undefined
    //             ? targetCreateDto.dateStart
    //             : new Date(),
    //         deadline:
    //           targetCreateDto.deadline !== undefined
    //             ? targetCreateDto.deadline
    //             : null,
    //         projectId: createdProject.id,
    //         accountId: user.account.id,
    //       };
    //       targetCreateEventDtos.push(targetCreateEventDto);
    //       return createdTarget;
    //     },
    //   );
    //   await Promise.all(createTargetsPromises);
    // }

    // const createdEventProjectDto: ProjectCreateEventDto = {
    //   eventType: 'PROJECT_CREATED',
    //   id: createdProject.id,
    //   projectName: projectCreateDto.projectName,
    //   programId:
    //     projectCreateDto.programId !== undefined
    //       ? projectCreateDto.programId
    //       : null,
    //   content:
    //     projectCreateDto.content !== undefined
    //       ? projectCreateDto.content
    //       : null,
    //   type:
    //     projectCreateDto.type !== undefined
    //       ? (projectCreateDto.type as string)
    //       : (TypeProject.PROJECT as string), // TypeProject alias for Type (project)
    //   organizationId: projectCreateDto.organizationId,
    //   createdAt: new Date(),
    //   strategyId:
    //     projectCreateDto.strategyId !== undefined
    //       ? projectCreateDto.strategyId
    //       : null,
    //   accountId: user.account.id,
    //   userId: user.id,
    //   targetCreateDtos:
    //     targetCreateEventDtos.length > 0 ? targetCreateEventDtos : null,
    // };
    // try {
    //   await Promise.race([
    //     this.producerService.sendCreatedProjectToQueue(createdEventProjectDto),
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
      `${yellow('OK!')} - projectCreateDto: ${JSON.stringify(projectCreateDto)} - Создан новый проект!`,
    );
    const now = new Date();
    console.log(now.getTime() - start.getTime());
    return { id: createdProjectId };
  }

  @Patch(':projectId/update')
  @ApiOperation({ summary: 'Обновить проект по Id' })
  @ApiBody({
    description: 'ДТО для обновления проекта',
    type: ProjectUpdateDto,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: {
      id: 'ff6c48ae-8493-48cc-9c5d-cdd1393858e6',
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
    description: `{Объект} не найден!`,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiParam({
    name: 'projectId',
    required: true,
    description: 'Id проекта',
  })
  @ApiQuery({
    name: 'holderProductPostId',
    required: false,
    description: 'Id поста ответственного за задачу с типом Продукт',
  })
  async update(
    @Req() req: ExpressRequest,
    @Param('projectId') projectId: string,
    @Query('holderProductPostId') holderProductPostId: string,
    @Body() projectUpdateDto: ProjectUpdateDto,
  ): Promise<{ id: string }> {
    const user = req.user as ReadUserDto;
    const userPost = user.posts.find((post) => post.isDefault);
    const start = new Date();
    const convertCreateDtos: ConvertCreateDto[] = [];
    const convertUpdateDtos: ConvertUpdateDto[] = [];
    if (holderProductPostId) {
      const senderPost =
        await this.postService.findOneById(holderProductPostId);
      if (projectUpdateDto.targetCreateDtos.length > 0) {
        const convertCreationForTargetCreatePromises =
          projectUpdateDto.targetCreateDtos.map(async (target) => {
            const convertCreateDto = new ConvertCreateDto();
            const [postIdsFromSenderToTop, postIdsFromRecieverToTop] =
              await Promise.all([
                this.postService.getHierarchyToTop(holderProductPostId),
                this.postService.getHierarchyToTop(target.holderPostId),
              ]);

            const isCommonDivision = createPathFromSenderToRecieverPost(
              postIdsFromSenderToTop,
              postIdsFromRecieverToTop,
            ).isCommonDivision;
            const postIdsFromSenderToReciver =
              createPathFromSenderToRecieverPost(
                postIdsFromSenderToTop,
                postIdsFromRecieverToTop,
              ).postIdsFromSenderToReciver;

            setConvertPath(
              convertCreateDto,
              postIdsFromSenderToReciver,
              isCommonDivision,
            );
            convertCreateDto.convertTheme = target.content;
            convertCreateDto.pathOfPosts = postIdsFromSenderToReciver;
            convertCreateDto.deadline = target.deadline;
            convertCreateDto.convertType = TypeConvert.ORDER;
            convertCreateDto.host = senderPost;
            convertCreateDto.account = user.account;
            convertCreateDtos.push(convertCreateDto);
          });
        await Promise.all(convertCreationForTargetCreatePromises);
      }
      if (projectUpdateDto.targetUpdateDtos.length > 0) {
        const convertUpdationForTargetUpdatePromises =
          projectUpdateDto.targetUpdateDtos.map(async (target) => {
            const isProductTarget = target.type === TargetType.PRODUCT;

            if (target.convert) {
              const convertUpdateDto = new ConvertUpdateDto();
              if (target.holderPostId) {
                const [postIdsFromSenderToTop, postIdsFromRecieverToTop] =
                  await Promise.all([
                    isProductTarget
                      ? this.postService.getHierarchyToTop(userPost.id)
                      : this.postService.getHierarchyToTop(holderProductPostId),
                    this.postService.getHierarchyToTop(target.holderPostId),
                  ]);

                const isCommonDivision = createPathFromSenderToRecieverPost(
                  postIdsFromSenderToTop,
                  postIdsFromRecieverToTop,
                ).isCommonDivision;
                const postIdsFromSenderToReciver =
                  createPathFromSenderToRecieverPost(
                    postIdsFromSenderToTop,
                    postIdsFromRecieverToTop,
                  ).postIdsFromSenderToReciver;
                setConvertPath(
                  convertUpdateDto,
                  postIdsFromSenderToReciver,
                  isCommonDivision,
                );
                convertUpdateDto.pathOfPosts = postIdsFromSenderToReciver;
              }
              convertUpdateDto._id = target.convert.id;
              convertUpdateDto.convertTheme = target.content;
              convertUpdateDto.deadline = target.deadline;
              convertUpdateDto.host = isProductTarget ? userPost : senderPost;
              convertUpdateDto.targetId = target._id;
              if (
                target.targetState === State.FINISHED ||
                target.targetState === State.REJECTED
              ) {
                convertUpdateDto.convertStatus = false;
              }
              convertUpdateDtos.push(convertUpdateDto);
            } else {
              const convertCreateDto = new ConvertCreateDto();
              const [postIdsFromSenderToTop, postIdsFromRecieverToTop] =
                await Promise.all([
                  isProductTarget
                    ? this.postService.getHierarchyToTop(userPost.id)
                    : this.postService.getHierarchyToTop(holderProductPostId),
                  this.postService.getHierarchyToTop(target.holderPostId),
                ]);
              const isCommonDivision = createPathFromSenderToRecieverPost(
                postIdsFromSenderToTop,
                postIdsFromRecieverToTop,
              ).isCommonDivision;
              const postIdsFromSenderToReciver =
                createPathFromSenderToRecieverPost(
                  postIdsFromSenderToTop,
                  postIdsFromRecieverToTop,
                ).postIdsFromSenderToReciver;
              setConvertPath(
                convertCreateDto,
                postIdsFromSenderToReciver,
                isCommonDivision,
              );
              convertCreateDto.convertTheme = target.content;
              convertCreateDto.pathOfPosts = postIdsFromSenderToReciver;
              convertCreateDto.deadline = target.deadline;
              convertCreateDto.convertType = TypeConvert.ORDER;
              convertCreateDto.host = isProductTarget ? userPost : senderPost;
              convertCreateDto.account = user.account;
              convertCreateDto.targetId = target._id;
              convertCreateDtos.push(convertCreateDto);
            }
          });
        await Promise.all(convertUpdationForTargetUpdatePromises);
      }
    }
    if (projectUpdateDto.strategyId != null) {
      const strategy = await this.strategyService.findOneById(
        projectUpdateDto.strategyId,
      );
      projectUpdateDto.strategy = strategy;
    }
    const updatedProjectId = await this.projectService.update(
      projectId,
      projectUpdateDto,
      convertCreateDtos,
      convertUpdateDtos,
    );

    this.logger.info(
      `${yellow('OK!')} - UPDATED PROJECT: ${JSON.stringify(projectUpdateDto)} - Проект успешно обновлен!`,
    );
    const now = new Date();
    console.log(now.getTime() - start.getTime());
    return { id: updatedProjectId };
  }

  @Get(':programId/program')
  @ApiOperation({ summary: 'Вернуть программу по ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: findOneProgramExample,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Вы не авторизованы!',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Программа не найдена!',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiParam({
    name: 'programId',
    required: true,
    description: 'Id программы',
  })
  async findOneProgram(
    @Param('programId') programId: string,
  ): Promise<{ program: ProjectReadDto; projects: ProjectReadDto[] }> {
    const program = await this.projectService.findOneProgramById(programId);
    const projectsInProgram =
      await this.projectService.findAllNotRejectedProjectsByProgramIdForOrganization(
        programId,
        program.organization.id,
      );
    return { program: program, projects: projectsInProgram };
  }

  @Get(':projectId')
  @ApiOperation({ summary: 'Вернуть проект по ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: findOneExample,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Вы не авторизованы!',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: `Проект не найден!`,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiParam({
    name: 'projectId',
    required: true,
    description: 'Id проекта',
  })
  async findOne(
    @Param('projectId') projectId: string,
  ): Promise<{ project: ProjectReadDto; strategies: StrategyReadDto[] }> {
    const project = await this.projectService.findOneById(projectId, [
      'strategy',
      'targets.targetHolders.post',
      'targets.convert',
      'organization',
    ]);
    const strategies = await this.strategyService.findAllActiveForOrganization(
      project.organization.id,
    );
    return { project: project, strategies: strategies };
  }
}
