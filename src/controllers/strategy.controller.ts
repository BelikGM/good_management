import {
  Body,
  Controller,
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
import { StrategyReadDto } from 'src/contracts/strategy/read-strategy.dto';
import { StrategyService } from 'src/application/services/strategy/strategy.service';
import { StrategyCreateDto } from 'src/contracts/strategy/create-strategy.dto';
import { StrategyUpdateDto } from 'src/contracts/strategy/update-strategy.dto';
import { OrganizationService } from 'src/application/services/organization/organization.service';
import { Logger } from 'winston';
import { blue, red, green, yellow, bold } from 'colorette';
import { StrategyCreateEventDto } from 'src/contracts/strategy/createEvent-strategy.dto';
import { ProducerService } from 'src/application/services/producer/producer.service';
import { StrategyUpdateEventDto } from 'src/contracts/strategy/updateEvent-strategy.dto';
import { TimeoutError } from 'rxjs';
import { ObjectiveCreateDto } from 'src/contracts/objective/create-objective.dto';
import { ObjectiveService } from 'src/application/services/objective/objective.service';
import { ObjectiveCreateEventDto } from 'src/contracts/objective/createEvent-objective.dto';
import { Request as ExpressRequest } from 'express';
import { ReadUserDto } from 'src/contracts/user/read-user.dto';
import { AccessTokenGuard } from 'src/guards/accessToken.guard';
import {
  findAllStrategiesExample,
  findeOneStrategyExample,
} from 'src/constants/swagger-examples/strategy/strategy-examples';
import { ActionAccess } from 'src/decorators/action-access.decorator';
import { ModuleAccess } from 'src/decorators/module-access.decorator';
import { Modules, Actions } from 'src/domains/roleSetting.entity';
import { PermissionsGuard } from 'src/guards/permission.guard';

@ApiTags('Strategy')
@ApiBearerAuth('access-token')
@UseGuards(AccessTokenGuard)
@Controller('strategies')
export class StrategyController {
  constructor(
    private readonly strategyService: StrategyService,
    private readonly organizationService: OrganizationService,
    private readonly producerService: ProducerService,
    private readonly objectiveService: ObjectiveService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  @Get(':organizationId')
  @UseGuards(PermissionsGuard)
  @ModuleAccess(Modules.STRATEGY)
  @ActionAccess(Actions.READ)
  @ApiOperation({ summary: 'Получить стратегию по организации' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: findAllStrategiesExample,
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
  ): Promise<StrategyReadDto[]> {
    const strategies =
      await this.strategyService.findAllForOrganization(organizationId);
    return strategies;
  }

  @Patch(':strategyId/update')
  @UseGuards(PermissionsGuard)
  @ModuleAccess(Modules.STRATEGY)
  @ActionAccess(Actions.UPDATE)
  @ApiOperation({ summary: 'Обновить стратегию по Id' })
  @ApiBody({
    description: 'ДТО для обновления стратегии',
    type: StrategyUpdateDto,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: 'ed2dfe55-b678-4f7e-a82e-ccf395afae05',
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
    description: `Стратегия не найдена!`,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiParam({ name: 'strategyId', required: true, description: 'Id стратегии' })
  async update(
    @Param('strategyId') strategyId: string,
    @Body() strategyUpdateDto: StrategyUpdateDto,
  ): Promise<{ id: string }> {
    const updatedStrategyId = await this.strategyService.update(
      strategyId,
      strategyUpdateDto,
    );
    const updatedStrategyEventDto: StrategyUpdateEventDto = {
      eventType: 'STRATEGY_UPDATED',
      id: updatedStrategyId,
      state:
        strategyUpdateDto.state !== undefined
          ? (strategyUpdateDto.state as string)
          : null,
      content:
        strategyUpdateDto.content !== undefined
          ? strategyUpdateDto.content
          : null,
    };
    // try {
    //   await Promise.race([
    //     this.producerService.sendUpdatedStrategyToQueue(
    //       updatedStrategyEventDto,
    //     ),
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
      `${yellow('OK!')} - strategyUpdateDto: ${JSON.stringify(strategyUpdateDto)} - Стратегия успешно обновлена!`,
    );
    return { id: updatedStrategyId };
  }

  @Get(':strategyId/strategy')
  @UseGuards(PermissionsGuard)
  @ModuleAccess(Modules.STRATEGY)
  @ActionAccess(Actions.READ)
  @ApiOperation({ summary: 'Получить стратегию по ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: findeOneStrategyExample,
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
    description: `Стратегия не найдена!`,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiParam({ name: 'strategyId', required: true, description: 'Id стратегии' })
  async findOne(
    @Param('strategyId') strategyId: string,
  ): Promise<StrategyReadDto> {
    const strategy = await this.strategyService.findOneById(strategyId);
    return strategy;
  }

  @Post('new')
  @UseGuards(PermissionsGuard)
  @ModuleAccess(Modules.STRATEGY)
  @ActionAccess(Actions.CREATE)
  @ApiOperation({ summary: 'Создать стратегию' })
  @ApiBody({
    description: 'ДТО для создания цели',
    type: StrategyCreateDto,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: {
      id: '21dcf96d-1e6a-4c8c-bc12-c90589b40e93',
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
  async create(
    @Req() req: ExpressRequest,
    @Body() strategyCreateDto: StrategyCreateDto,
  ): Promise<{ id: string }> {
    const user = req.user as ReadUserDto;
    const organization = await this.organizationService.findOneById(
      strategyCreateDto.organizationId,
    );
    const postCreator = user.posts.find((post) => post.isDefault);
    strategyCreateDto.postCreator = postCreator;
    strategyCreateDto.account = user.account;
    strategyCreateDto.organization = organization;
    const createdStrategyId =
      await this.strategyService.create(strategyCreateDto);
    const createdStrategy =
      await this.strategyService.findOneById(createdStrategyId);
    const objectiveCreateDto: ObjectiveCreateDto = {
      content: ['', ''],
      rootCause: [''],
      situation: [''],
      strategyId: createdStrategyId,
      strategy: createdStrategy,
      account: user.account,
    };
    const createdObjectiveId =
      await this.objectiveService.create(objectiveCreateDto);
    const createdStrategyEventDto: StrategyCreateEventDto = {
      eventType: 'STRATEGY_CREATED',
      id: createdStrategyId,
      content: strategyCreateDto.content,
      userId: user.id,
      accountId: user.account.id,
      organizationId: strategyCreateDto.organizationId,
    };
    const createdEventObjectiveDto: ObjectiveCreateEventDto = {
      eventType: 'OBJECTIVE_CREATED',
      id: createdObjectiveId,
      situation:
        objectiveCreateDto.situation !== undefined
          ? objectiveCreateDto.situation
          : null,
      content:
        objectiveCreateDto.content !== undefined
          ? objectiveCreateDto.content
          : null,
      rootCause:
        objectiveCreateDto.rootCause !== undefined
          ? objectiveCreateDto.rootCause
          : null,
      createdAt: new Date(),
      strategyId: createdStrategy.id,
      accountId: user.account.id,
    };
    // try {
    //   await Promise.race([
    //     this.producerService.sendCreatedStrategyToQueue(
    //       createdStrategyEventDto,
    //     ),
    //     this.producerService.sendCreatedObjectiveToQueue(
    //       createdEventObjectiveDto,
    //     ),
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
      `${yellow('OK!')} - strategyCreateDto: ${JSON.stringify(strategyCreateDto)} - Создана новая стратегия!`,
    );
    return { id: createdStrategyId };
  }
}
