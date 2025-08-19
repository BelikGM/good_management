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
import { StatisticService } from 'src/application/services/statistic/statistic.service';
import { StatisticReadDto } from 'src/contracts/statistic/read-statistic.dto';
import { StatisticCreateDto } from 'src/contracts/statistic/create-statistic.dto';
import { Type } from 'src/domains/statistic.entity';
import { StatisticDataService } from 'src/application/services/statisticData/statisticData.service';
import { PostService } from 'src/application/services/post/post.service';
import { Logger } from 'winston';
import { yellow } from 'colorette';
import { StatisticUpdateDto } from 'src/contracts/statistic/update-statistic.dto';
import { ProducerService } from 'src/application/services/producer/producer.service';
import { StatisticDataCreateEventDto } from 'src/contracts/statisticData/createEvent-statisticData.dto';
import { StatisticCreateEventDto } from 'src/contracts/statistic/createEvent-statistic.dto';
import { StatisticDataUpdateEventDto } from 'src/contracts/statisticData/updateEvent-statisticData.dto';
import { StatisticUpdateEventDto } from 'src/contracts/statistic/updateEvent-statistic.dto';
import { StatisticUpdateBulkDto } from 'src/contracts/statistic/updateBulk_statistic.dto';
import { AccessTokenGuard } from 'src/guards/accessToken.guard';
import { Request as ExpressRequest } from 'express';
import { ReadUserDto } from 'src/contracts/user/read-user.dto';
import {
  findAllStatisticsExample,
  findOneStatisticExample,
} from 'src/constants/swagger-examples/statistic/statistic-examples';
import { ReportDay } from 'src/domains/organization.entity';
import { viewTypes } from 'src/constants/extraTypes/statisticViewTypes';
import { StatisticDataReadDto } from 'src/contracts/statisticData/read-statisticData.dto';
import { ActionAccess } from 'src/decorators/action-access.decorator';
import { ModuleAccess } from 'src/decorators/module-access.decorator';
import { Modules, Actions } from 'src/domains/roleSetting.entity';
import { PermissionsGuard } from 'src/guards/permission.guard';

@UseGuards(AccessTokenGuard)
@ApiTags('Statistic')
@ApiBearerAuth('access-token')
@Controller('statistics')
export class StatisticController {
  constructor(
    private readonly statisticService: StatisticService,
    private readonly statisticDataService: StatisticDataService,
    private readonly postService: PostService,
    private readonly producerService: ProducerService,
    @Inject('winston') private readonly logger: Logger,
  ) { }

  @Get(':organizationId')
  @UseGuards(PermissionsGuard)
  @ModuleAccess(Modules.STATISTIC)
  @ActionAccess(Actions.READ)
  @ApiOperation({ summary: 'Все статистики в организации' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: findAllStatisticsExample,
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
    name: 'statisticData',
    required: false,
    description: 'Флаг для отправки доп. данных (точек)',
    example: true,
  })
  async findAll(
    @Query('statisticData') statisticData: boolean,
    @Param('organizationId') organizationId: string,
  ): Promise<StatisticReadDto[]> {
    let relations: string[];
    if (statisticData) {
      relations = ['statisticDatas', 'post'];
    } else {
      relations = ['post'];
    }
    return await this.statisticService.findAllForOrganization(
      organizationId,
      relations,
    );
  }

  @Patch(':statisticId/update')
  @UseGuards(PermissionsGuard)
  @ModuleAccess(Modules.STATISTIC)
  @ActionAccess(Actions.UPDATE)
  @ApiOperation({ summary: 'Обновить статистику' })
  @ApiBody({
    description: 'ДТО для обновления статистики',
    type: StatisticUpdateDto,
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
    description: 'Ресурс не найден!',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiParam({
    name: 'statisticId',
    required: true,
    description: 'Id статистики',
  })
  async update(
    @Req() req: ExpressRequest,
    @Param('statisticId') statisticId: string,
    @Body() statisticUpdateDto: StatisticUpdateDto,
  ): Promise<{ id: string }> {
    const user = req.user as ReadUserDto;
    const statisticDataCreateEventDtos: StatisticDataCreateEventDto[] = [];
    const statisticDataUpdateEventDtos: StatisticDataUpdateEventDto[] = [];
    const post =
      statisticUpdateDto.postId !== undefined
        ? await this.postService.findOneById(statisticUpdateDto.postId)
        : null;
    if (post !== null) {
      statisticUpdateDto.post = post;
    }
    const updatedStatisticId = await this.statisticService.update(
      statisticId,
      statisticUpdateDto,
    );
    const statistic =
      await this.statisticService.findOneById(updatedStatisticId);
    if (statisticUpdateDto.statisticDataUpdateDtos !== undefined) {
      const updateStatisticDataPromises =
        statisticUpdateDto.statisticDataUpdateDtos.map(
          async (statisticDataUpdateDto) => {
            const updatedStatisticDataId =
              await this.statisticDataService.update(statisticDataUpdateDto);
            const statisticDataUpdateEventDto: StatisticDataUpdateEventDto = {
              id: updatedStatisticDataId,
              value:
                statisticDataUpdateDto.value !== undefined
                  ? statisticDataUpdateDto.value
                  : null,
              valueDate:
                statisticDataUpdateDto.valueDate !== undefined
                  ? statisticDataUpdateDto.valueDate
                  : null,
              correlationType:
                statisticDataUpdateDto.correlationType !== undefined
                  ? statisticDataUpdateDto.correlationType
                  : null,
              updatedAt: new Date(),
              statisticId: statistic.id,
              accountId: user.account.id,
            };
            statisticDataUpdateEventDtos.push(statisticDataUpdateEventDto);
            return updatedStatisticDataId;
          },
        );
      await Promise.all(updateStatisticDataPromises);
    }

    if (statisticUpdateDto.statisticDataCreateDtos !== undefined) {
      const createStatisticDataPromises =
        statisticUpdateDto.statisticDataCreateDtos.map(
          async (statisticDataCreateDto) => {
            statisticDataCreateDto.statistic = statistic;
            const createdStatisticDataId =
              await this.statisticDataService.create(statisticDataCreateDto);
            const statisticDataCreateEventDto: StatisticDataCreateEventDto = {
              id: createdStatisticDataId,
              value: statisticDataCreateDto.value,
              valueDate: statisticDataCreateDto.valueDate,
              correlationType: statisticDataCreateDto.correlationType,
              createdAt: new Date(),
              statisticId: statistic.id,
              accountId: user.account.id,
            };
            statisticDataCreateEventDtos.push(statisticDataCreateEventDto);
            return createdStatisticDataId;
          },
        );
      await Promise.all(createStatisticDataPromises);
    }

    const statisticUpdateEventDto: StatisticUpdateEventDto = {
      eventType: 'STATISTIC_UPDATED',
      id: statistic.id,
      type:
        statisticUpdateDto.type !== undefined
          ? (statisticUpdateDto.type as string)
          : null,
      name:
        statisticUpdateDto.name !== undefined ? statisticUpdateDto.name : null,
      description:
        statisticUpdateDto.description !== undefined
          ? statisticUpdateDto.description
          : null,
      updatedAt: new Date(),
      postId:
        statisticUpdateDto.postId !== undefined
          ? statisticUpdateDto.postId
          : null,
      statisticDataUpdateDtos:
        statisticDataUpdateEventDtos.length > 0
          ? statisticDataUpdateEventDtos
          : null,
      statisticDataCreateDtos:
        statisticDataCreateEventDtos.length > 0
          ? statisticDataCreateEventDtos
          : null,
      accountId: user.account.id,
    };
    // try {
    //   await Promise.race([
    //     this.producerService.sendUpdatedStatisticToQueue(
    //       statisticUpdateEventDto,
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
      `${yellow('OK!')} - UPDATED STATISTIC: ${JSON.stringify(statisticUpdateDto)} - Статистика успешно обновлена!`,
    );
    return { id: updatedStatisticId };
  }

  @Patch(':postId/updateBulk')
  @UseGuards(PermissionsGuard)
  @ModuleAccess(Modules.STATISTIC)
  @ActionAccess(Actions.UPDATE)
  @ApiOperation({ summary: 'Обновить статистикам postId' })
  @ApiBody({
    description: 'ДТО для обновления статистики',
    type: StatisticUpdateBulkDto,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: 'Статистики успешно обновлены.',
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
    description: 'Ресурс не найден!',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiParam({
    name: 'postId',
    required: true,
    description: 'Id поста',
    example: '2420fabb-3e37-445f-87e6-652bfd5a050c',
  })
  async updateBulk(
    @Param('postId') postId: string,
    @Body() statisticUpdateBulkDto: StatisticUpdateBulkDto,
  ): Promise<{ message: string }> {
    const post = await this.postService.findOneById(postId);
    const updateStatisticPromises = statisticUpdateBulkDto.ids.map(
      async (id) => {
        const statisticUpdateDto: StatisticUpdateDto = {
          _id: id,
          postId: postId,
          post: post,
        };
        const updatedStatisticId = await this.statisticService.update(
          statisticUpdateDto._id,
          statisticUpdateDto,
        );

        return updatedStatisticId;
      },
    );
    await Promise.all(updateStatisticPromises);
    return { message: 'Статистики успешно обновлены.' };
  }

  @Post('new')
  @UseGuards(PermissionsGuard)
  @ModuleAccess(Modules.STATISTIC)
  @ActionAccess(Actions.CREATE)
  @ApiOperation({ summary: 'Создать статистику' })
  @ApiBody({
    description: 'ДТО для создания статистики',
    type: StatisticCreateDto,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'CREATED!',
    example: { id: 'f35dc993-1c7e-4f55-9ddd-45d8841d4396' },
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
    @Body() statisticCreateDto: StatisticCreateDto,
  ): Promise<{ id: string }> {
    const statisticDataCreateEventDtos: StatisticDataCreateEventDto[] = [];
    const user = req.user as ReadUserDto;
    const post = await this.postService.findOneById(statisticCreateDto.postId);

    statisticCreateDto.account = user.account;
    statisticCreateDto.post = post;

    const createdStatistic =
      await this.statisticService.create(statisticCreateDto);

    if (statisticCreateDto.statisticDataCreateDtos !== undefined) {
      const statisticDataCreatePromises =
        statisticCreateDto.statisticDataCreateDtos.map(
          async (statisticDataCreateDto) => {
            statisticDataCreateDto.statistic = createdStatistic;
            const createdStatisticDataId =
              await this.statisticDataService.create(statisticDataCreateDto);
            const statisticDataCreateEventDto: StatisticDataCreateEventDto = {
              id: createdStatisticDataId,
              value: statisticDataCreateDto.value,
              valueDate: statisticDataCreateDto.valueDate,
              correlationType: statisticDataCreateDto.correlationType,
              createdAt: new Date(),
              statisticId: createdStatistic.id,
              accountId: user.account.id,
            };
            statisticDataCreateEventDtos.push(statisticDataCreateEventDto);
            return createdStatisticDataId;
          },
        );

      await Promise.all(statisticDataCreatePromises);
    }

    const statisticCreateEventDto: StatisticCreateEventDto = {
      eventType: 'STATISTIC_CREATED',
      id: createdStatistic.id,
      type:
        statisticCreateDto.type !== undefined
          ? (statisticCreateDto.type as string)
          : (Type.DIRECT as string),
      name: statisticCreateDto.name,
      description:
        statisticCreateDto.description !== undefined
          ? statisticCreateDto.description
          : null,
      createdAt: new Date(),
      postId: statisticCreateDto.postId,
      accountId: user.account.id,
      statisticDataCreateDtos:
        statisticDataCreateEventDtos.length > 0
          ? statisticDataCreateEventDtos
          : null,
    };

    // try {
    //   await Promise.race([
    //     this.producerService.sendCreatedStatisticToQueue(
    //       statisticCreateEventDto,
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
      `${yellow('OK!')} - statisticCreateDto: ${JSON.stringify(statisticCreateDto)} - Создана новая статистика!`,
    );
    return { id: createdStatistic.id };
  }


  @Get(':controlPanelId/statisticsInControlPanel')
  @UseGuards(PermissionsGuard)
  @ModuleAccess(Modules.STATISTIC)
  @ActionAccess(Actions.READ)
  @ApiOperation({ summary: 'Получить статистики по controlPanelId с пагинацией (всегда 12)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: findOneStatisticExample,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Вы не авторизованы!',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: `Статистика не найдена!`,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiParam({
    name: 'controlPanelId',
    required: true,
    description: 'Id панели управления',
  })
  @ApiQuery({
    name: 'datePoint',
    required: true,
    description: 'Дата от которой будет вестись отчет (YYYY-MM-DD) зависит от типа отображения и направления хода по графику',
    example: '2022-10-28',
  })
  async findAllForControlPanel(
    @Param('controlPanelId') controlPanelId: string,
    @Query('pagination') pagination: number,
    @Query('datePoint') datePoint: string,
  ): Promise<any[]> {
    const statistics = await this.statisticService.findAllForControlPanel(controlPanelId, pagination, datePoint);
    return statistics;
  }

  @Get(':statisticId/statistic')
  @UseGuards(PermissionsGuard)
  @ModuleAccess(Modules.STATISTIC)
  @ActionAccess(Actions.READ)
  @ApiOperation({ summary: 'Получить статистику по ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: findOneStatisticExample,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Вы не авторизованы!',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: `Статистика не найдена!`,
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiParam({
    name: 'statisticId',
    required: true,
    description: 'Id статистики',
  })
  @ApiQuery({
    name: 'viewType',
    enum: viewTypes,
    required: true,
    description: 'Тип отображения'
  })
  @ApiQuery({
    name: 'datePoint',
    required: true,
    description: 'Дата от которой будет вестись отчет (YYYY-MM-DD) зависит от типа отображения и направления хода по графику',
    example: '2022-10-28',
  })
  async findOne(
    @Param('statisticId') statisticId: string,
    @Query('datePoint') datePoint: string,
    @Query('viewType') viewType: viewTypes,
  ): Promise<{ statistic: StatisticReadDto; statisticData: any[] }> {
    const statistic = await this.statisticService.findOneById(statisticId, [
      'post',
    ]);
    const statisticData: any[] = [];
    switch (viewType) {
      case viewTypes.DAILY:
        const statisticDataDaily = await this.statisticDataService.findDaily(statisticId, datePoint);
        statisticData.push(...statisticDataDaily)
        break;
      case viewTypes.MONTHLY:
        const statisticDataMonthly = await this.statisticDataService.findMonthly(statisticId, datePoint);
        statisticData.push(...statisticDataMonthly)
        break;
      case viewTypes.YEARLY:
        const statisticDataYearly = await this.statisticDataService.findYearly(statisticId, datePoint);
        statisticData.push(...statisticDataYearly)
        break;
      case viewTypes.THIRTEEN:
        const statisticDataThirteen = await this.statisticDataService.findSeveralWeeks(statisticId, datePoint, 13);
        statisticData.push(...statisticDataThirteen)
        break;
      case viewTypes.TWENTY_SIX:
        const statisticDataTwentySix = await this.statisticDataService.findSeveralWeeks(statisticId, datePoint, 26);
        statisticData.push(...statisticDataTwentySix)
        break;
      case viewTypes.FIFTY_TWO:
        const statisticDataFiftyTwo = await this.statisticDataService.findSeveralWeeks(statisticId, datePoint, 52);
        statisticData.push(...statisticDataFiftyTwo)
        break;
    }
    return { statistic, statisticData };
  }
}
