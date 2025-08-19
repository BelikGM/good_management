import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ObjectiveService } from 'src/application/services/objective/objective.service';
import { ObjectiveReadDto } from 'src/contracts/objective/read-objective.dto';
import { ObjectiveUpdateDto } from 'src/contracts/objective/update-objective.dto';
import { Logger } from 'winston';
import { blue, red, green, yellow, bold } from 'colorette';
import { ProducerService } from 'src/application/services/producer/producer.service';
import { ObjectiveUpdateEventDto } from 'src/contracts/objective/updateEvent-objective.dto';
import { TimeoutError } from 'rxjs';
import { Request as ExpressRequest } from 'express';
import { ReadUserDto } from 'src/contracts/user/read-user.dto';
import { AccessTokenGuard } from 'src/guards/accessToken.guard';
import {
  findAllObjectivesExample,
  findOneObjectiveExample,
} from 'src/constants/swagger-examples/objective/objective-examples';
import { ActionAccess } from 'src/decorators/action-access.decorator';
import { ModuleAccess } from 'src/decorators/module-access.decorator';
import { Modules, Actions } from 'src/domains/roleSetting.entity';
import { PermissionsGuard } from 'src/guards/permission.guard';

@ApiTags('Objective')
@ApiBearerAuth('access-token')
@UseGuards(AccessTokenGuard)
@Controller('objectives')
export class ObjectiveController {
  constructor(
    private readonly objectiveService: ObjectiveService,
    private readonly producerService: ProducerService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  @Get(':organizationId')
  @UseGuards(PermissionsGuard)
  @ModuleAccess(Modules.OBJECTIVE)
  @ActionAccess(Actions.READ)
  @ApiOperation({ summary: 'Все краткосрочные цели в организации' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: findAllObjectivesExample,
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
  ): Promise<ObjectiveReadDto[]> {
    const objectives =
      await this.objectiveService.findAllForOrganization(organizationId);
    return objectives;
  }

  @Patch(':objectiveId/update')
  @UseGuards(PermissionsGuard)
  @ModuleAccess(Modules.OBJECTIVE)
  @ActionAccess(Actions.UPDATE)
  @ApiOperation({ summary: 'Обновить краткосрочную цель по ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: '0a2f6024-e6f7-49b9-a008-70665bd36881',
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
    description: `Краткосрочная цель не найдена!`,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiParam({
    name: 'objectiveId',
    required: true,
    description: 'Id краткосрочной цели',
  })
  async update(
    @Req() req: ExpressRequest,
    @Param('objectiveId') objectiveId: string,
    @Body() objectiveUpdateDto: ObjectiveUpdateDto,
  ): Promise<{ id: string }> {
    const user = req.user as ReadUserDto;
    const updatedObjectiveId = await this.objectiveService.update(
      objectiveId,
      objectiveUpdateDto,
    );
    const updatedEventObjectiveDto: ObjectiveUpdateEventDto = {
      eventType: 'OBJECTIVE_UPDATED',
      id: updatedObjectiveId,
      situation:
        objectiveUpdateDto.situation !== undefined
          ? objectiveUpdateDto.situation
          : null,
      content:
        objectiveUpdateDto.content !== undefined
          ? objectiveUpdateDto.content
          : null,
      rootCause:
        objectiveUpdateDto.rootCause !== undefined
          ? objectiveUpdateDto.rootCause
          : null,
      updatedAt: new Date(),
      accountId: user.account.id,
    };
    // try {
    //   await Promise.race([
    //     this.producerService.sendUpdatedObjectiveToQueue(
    //       updatedEventObjectiveDto,
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
      `${yellow('OK!')} - UPDATED OBJECTIVE: ${JSON.stringify(objectiveUpdateDto)} - Краткосрочная цель успешно обновлена!`,
    );
    return { id: updatedObjectiveId };
  }

  @Get(':strategyId/objective')
  @UseGuards(PermissionsGuard)
  @ModuleAccess(Modules.OBJECTIVE)
  @ActionAccess(Actions.READ)
  @ApiOperation({ summary: 'Получить цель по ID стратегии' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: findOneObjectiveExample,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Вы не авторизованы!',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: `Краткосрочная цель не найдена!`,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiParam({ name: 'strategyId', required: true, description: 'Id стратегии' })
  async findOne(
    @Param('strategyId') strategyId: string,
  ): Promise<ObjectiveReadDto> {
    const objective =
      await this.objectiveService.findOneByStrategyId(strategyId);
    return objective;
  }
}
