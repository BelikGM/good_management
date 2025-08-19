import {
  Controller,
  Get,
  Post,
  HttpStatus,
  Param,
  Body,
  Patch,
  Inject,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { GoalService } from 'src/application/services/goal/goal.service';
import { OrganizationService } from 'src/application/services/organization/organization.service';
import { GoalCreateDto } from 'src/contracts/goal/create-goal.dto';
import { GoalReadDto } from 'src/contracts/goal/read-goal.dto';
import { GoalUpdateDto } from 'src/contracts/goal/update-goal.dto';
import { Logger } from 'winston';
import { yellow } from 'colorette';
import { ProducerService } from 'src/application/services/producer/producer.service';
import { GoalCreateEventDto } from 'src/contracts/goal/createEvent-goal.dto';
import { GoalUpdateEventDto } from 'src/contracts/goal/updateEvent-goal.dto';
import { AccessTokenGuard } from 'src/guards/accessToken.guard';
import { Request as ExpressRequest } from 'express';
import { ReadUserDto } from 'src/contracts/user/read-user.dto';
import { findAllGoalsExample } from 'src/constants/swagger-examples/goal/goal-examples';
import { ActionAccess } from 'src/decorators/action-access.decorator';
import { ModuleAccess } from 'src/decorators/module-access.decorator';
import { Modules, Actions } from 'src/domains/roleSetting.entity';
import { PermissionsGuard } from 'src/guards/permission.guard';

@UseGuards(AccessTokenGuard)
@ApiTags('Goal')
@ApiBearerAuth('access-token')
@Controller('goals')
export class GoalController {
  constructor(
    private readonly goalService: GoalService,
    private readonly organizationService: OrganizationService,
    private readonly producerService: ProducerService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  @Get(':organizationId')
  @UseGuards(PermissionsGuard)
  @ModuleAccess(Modules.GOLE)
  @ActionAccess(Actions.READ)
  @ApiOperation({ summary: 'Цель организации' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: findAllGoalsExample,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Вы не авторизованы!',
  })
  @ApiParam({
    name: 'organizationId',
    required: true,
    description: 'Id организации',
    example: '2d1cea4c-7cea-4811-8cd5-078da7f20167',
  })
  async findAll(
    @Param('organizationId') organizationId: string,
  ): Promise<GoalReadDto> {
    const goal = await this.goalService.findOneByOrganizationId(organizationId);
    return goal;
  }

  @Patch(':goalId/update')
  @UseGuards(PermissionsGuard)
  @ModuleAccess(Modules.GOLE)
  @ActionAccess(Actions.UPDATE)
  @ApiOperation({ summary: 'Обновить цель по ID' })
  @ApiBody({
    description: 'ДТО для обновления цели',
    type: GoalUpdateDto,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: { id: '7468bad1-a4b4-4600-8ac8-098f3e865b11' },
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
    description: 'Цель не найдена!',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiParam({
    name: 'goalId',
    required: true,
    description: 'Id цели',
  })
  async update(
    @Req() req: ExpressRequest,
    @Param('goalId') goalId: string,
    @Body() goalUpdateDto: GoalUpdateDto,
  ): Promise<{ id: string }> {
    const user = req.user as ReadUserDto;
    const updatedGoalId = await this.goalService.update(goalId, goalUpdateDto);
    const updateEventGoalDto: GoalUpdateEventDto = {
      eventType: 'GOAL_UPDATED',
      id: updatedGoalId,
      content: goalUpdateDto.content,
      updatedAt: new Date(),
      accountId: user.account.id,
    };
    // try {
    //   await Promise.race([
    //     this.producerService.sendUpdatedGoalToQueue(updateEventGoalDto),
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
      `${yellow('OK!')} - UPDATED GOAL: ${JSON.stringify(goalUpdateDto)} - Цель успешно обновлена!`,
    );
    return { id: updatedGoalId };
  }

  @Post('new')
  @UseGuards(PermissionsGuard)
  @ModuleAccess(Modules.GOLE)
  @ActionAccess(Actions.CREATE)
  @ApiOperation({ summary: 'Создать цель' })
  @ApiBody({
    description: 'ДТО для создания цели',
    type: GoalCreateDto,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'CREATED!',
    example: { id: 'da1787cb-a79a-4663-8232-c13cacfdb953' },
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
    @Req() req: ExpressRequest,
    @Body() goalCreateDto: GoalCreateDto,
  ): Promise<{ id: string }> {
    const user = req.user as ReadUserDto;
    const organization = await this.organizationService.findOneById(
      goalCreateDto.organizationId,
    );
    const postCreator = user.posts.find((post) => post.isDefault);
    goalCreateDto.postCreator = postCreator;
    goalCreateDto.account = user.account;
    goalCreateDto.organization = organization;
    const createdGoalId = await this.goalService.create(goalCreateDto);
    const createEventGoalDto: GoalCreateEventDto = {
      eventType: 'GOAL_CREATED',
      id: createdGoalId,
      content: goalCreateDto.content,
      createdAt: new Date(),
      organizationId: goalCreateDto.organizationId,
      userId: user.id,
      accountId: user.account.id,
    };
    // try {
    //   await Promise.race([
    //     this.producerService.sendCreatedGoalToQueue(createEventGoalDto),
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
      `${yellow('OK!')} - goalCreateDto: ${JSON.stringify(goalCreateDto)} - Создана новая цель!`,
    );
    return { id: createdGoalId };
  }
}
