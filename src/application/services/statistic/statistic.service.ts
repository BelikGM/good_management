import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Statistic } from 'src/domains/statistic.entity';
import { StatisticRepository } from './repository/statistic.repository';
import { AccountReadDto } from 'src/contracts/account/read-account.dto';
import { StatisticReadDto } from 'src/contracts/statistic/read-statistic.dto';

import { Logger } from 'winston';
import { StatisticCreateDto } from 'src/contracts/statistic/create-statistic.dto';
import { StatisticUpdateDto } from 'src/contracts/statistic/update-statistic.dto';
import { In } from 'typeorm';
import { CorrelationType } from 'src/domains/statisticData.entity';
import { viewTypes } from 'src/constants/extraTypes/statisticViewTypes';
import { StatisticDataService } from '../statisticData/statisticData.service';

@Injectable()
export class StatisticService {
  constructor(
    @InjectRepository(Statistic)
    private readonly statisticRepository: StatisticRepository,
    private readonly statisticDataService: StatisticDataService,
    @Inject('winston') private readonly logger: Logger,
  ) { }

  async findAllForAccount(
    account: AccountReadDto,
    relations?: string[],
    isActive?: boolean,
  ): Promise<StatisticReadDto[]> {
    try {
    const where: any = { account: { id: account.id } };
  
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const statistics = await this.statisticRepository.find({
      where: where,
      relations: relations ?? [],
    });

      return statistics.map((statistic) => ({
        id: statistic.id,
        type: statistic.type,
        name: statistic.name,
        description: statistic.description,
        createdAt: statistic.createdAt,
        updatedAt: statistic.updatedAt,
        statisticDatas: statistic.statisticDatas,
        post: statistic.post,
        account: statistic.account,
        panelToStatistics: statistic.panelToStatistics,
        isActive: statistic.isActive,
      }));
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при получении всех статистик!',
      );
    }
  }

  async findAllForOrganization(
    organizationId: string,
    relations?: string[],
      isActive?: boolean 
  ): Promise<StatisticReadDto[]> {
    try {
         const where: any = { 
      post: { organization: { id: organizationId } } 
    };
    
    // Добавить фильтрацию по isActive
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const statistics = await this.statisticRepository.find({
      where: where,
      relations: relations ?? [],
    });

      return statistics.map((statistic) => ({
        isActive: statistic.isActive,
        id: statistic.id,
        type: statistic.type,
        name: statistic.name,
        description: statistic.description,
        createdAt: statistic.createdAt,
        updatedAt: statistic.updatedAt,
        statisticDatas: statistic.statisticDatas,
        post: statistic.post,
        account: statistic.account,
        panelToStatistics: statistic.panelToStatistics,
      }));
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при получении всех статистик!',
      );
    }
  }

  async findOneById(
  id: string,
  relations?: string[],
  isActive?: boolean, // новый параметр
): Promise<StatisticReadDto> {
  try {
    const where: any = { id: id };
    
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const statistic = await this.statisticRepository.findOne({
      where: where,
      relations: relations ?? [],
    });

    if (!statistic)
      throw new NotFoundException(`Статистика с ID: ${id} не найдена`);
    
    const statisticReadDto: StatisticReadDto = {
      id: statistic.id,
      type: statistic.type,
      name: statistic.name,
      description: statistic.description,
      createdAt: statistic.createdAt,
      updatedAt: statistic.updatedAt,
      statisticDatas: statistic.statisticDatas,
      post: statistic.post,
      account: statistic.account,
      panelToStatistics: statistic.panelToStatistics,
      isActive: statistic.isActive, // добавляем новое поле
    };
    return statisticReadDto;
  } catch (err) {
    this.logger.error(err);
    if (err instanceof NotFoundException) {
      throw err;
    }

    throw new InternalServerErrorException('Ошибка при получении статистики');
  }
}

  async findBulk(ids: string[], isActive?: boolean): Promise<StatisticReadDto[]> { // новый параметр
  try {
    const where: any = { id: In(ids) };
    
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const statistics = await this.statisticRepository.find({
      where: where,
    });
    
    const foundIds = statistics.map((statistic) => statistic.id);
    const missingIds = ids.filter((id) => !foundIds.includes(id));
    if (missingIds.length > 0) {
      throw new NotFoundException(
        `Не найдены статистики с IDs: ${missingIds.join(', ')}`,
      );
    }
    
    return statistics.map((statistic) => ({
      id: statistic.id,
      type: statistic.type,
      name: statistic.name,
      description: statistic.description,
      createdAt: statistic.createdAt,
      updatedAt: statistic.updatedAt,
      statisticDatas: statistic.statisticDatas,
      post: statistic.post,
      account: statistic.account,
      panelToStatistics: statistic.panelToStatistics,
      isActive: statistic.isActive, // добавляем новое поле
    }));
  } catch (err) {
    this.logger.error(err);
    if (err instanceof NotFoundException) {
      throw err;
    }

    throw new InternalServerErrorException('Ошибка при получении статистик');
  }
}

  async findAllForControlPanel(
  controlPanelId: string,
  pagination: number,
  datePoint: string,
  isActive?: boolean,
  withStatisticData?: boolean, // <-- переименовали
): Promise<any[]> {
  try {
    const queryBuilder = this.statisticRepository
      .createQueryBuilder('statistic')
      .leftJoinAndSelect('statistic.panelToStatistics', 'p_t_s')
      .where('p_t_s.controlPanelId = :controlPanelId', { controlPanelId });
    
    if (isActive !== undefined) {
      queryBuilder.andWhere('statistic.isActive = :isActive', { isActive });
    }

    queryBuilder.orderBy('p_t_s.orderStatisticNumber', 'ASC');

    const statistics = await queryBuilder.getMany();

    const statisticsWithData = await Promise.all(
      statistics.map(async (statistic) => {
        let statisticDataResult: any[] = [];

        if (withStatisticData) {
          statisticDataResult = await this.statisticDataService.findSeveralWeeks(
            statistic.id,
            datePoint,
            13,
          );
        }

        return {
          id: statistic.id,
          type: statistic.type,
          name: statistic.name,
          description: statistic.description,
          createdAt: statistic.createdAt,
          updatedAt: statistic.updatedAt,
          statisticDatas: withStatisticData ? statisticDataResult : [], // <-- проверка по новому флагу
          post: statistic.post,
          account: statistic.account,
          panelToStatistics: statistic.panelToStatistics,
          isActive: statistic.isActive,
        };
      }),
    );

    return statisticsWithData;
  } catch (err) {
    this.logger.error(err);
    throw new InternalServerErrorException(
      'Ошибка при получении статистик в панели',
    );
  }
}

  async create(statisticCreateDto: StatisticCreateDto): Promise<Statistic> {
    try {
      const statistic = new Statistic();
      statistic.type = statisticCreateDto.type;
      statistic.name = statisticCreateDto.name;
      statistic.description = statisticCreateDto.description;
      statistic.account = statisticCreateDto.account;
      statistic.post = statisticCreateDto.post;
      statistic.isActive = statisticCreateDto.isActive ?? true;
      const createdStatistic = await this.statisticRepository.save(statistic);
      return createdStatistic;
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException('Ошибка при создании статистики!');
    }
  }

  async update(
    _id: string,
    statisticUpdateDto: StatisticUpdateDto,
  ): Promise<string> {
    try {
      const statistic = await this.statisticRepository.findOne({
        where: { id: _id },
      });
      if (!statistic) {
        throw new NotFoundException(`Статистика с ID ${_id} не найдена`);
      }
      if (statisticUpdateDto.type) statistic.type = statisticUpdateDto.type;
      if (statisticUpdateDto.name) statistic.name = statisticUpdateDto.name;
      if (statisticUpdateDto.description)
        statistic.description = statisticUpdateDto.description;
      if (statisticUpdateDto.post) statistic.post = statisticUpdateDto.post;
      if (statisticUpdateDto.isActive !== undefined)
        statistic.isActive = statisticUpdateDto.isActive;
      await this.statisticRepository.update(statistic.id, {
        type: statistic.type,
        name: statistic.name,
        description: statistic.description,
        post: statistic.post,
        isActive: statistic.isActive,
      });
      return statistic.id;
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new InternalServerErrorException(
        'Ошибка при обновлении статистики',
      );
    }
  }
  
  async findAllWithPeriod(
  organizationId: string,
  weeks: number,
  datePoint: string,
  isActive?: boolean,
  ): Promise<{ statistic: StatisticReadDto; statisticData: any[] }[]> {
  try {
    const where: any = { 
      post: { organization: { id: organizationId } } 
    };
    
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    // Получаем все статистики организации
    const statistics = await this.statisticRepository.find({
      where: where,
      relations: ['post'],
    });

    // Для каждой статистики получаем данные за указанный период
    const statisticsWithData = await Promise.all(
      statistics.map(async (statistic) => {
        const statisticData = await this.statisticDataService.findSeveralWeeks(
          statistic.id,
          datePoint,
          weeks,
        );

        const statisticReadDto: StatisticReadDto = {
          id: statistic.id,
          type: statistic.type,
          name: statistic.name,
          description: statistic.description,
          createdAt: statistic.createdAt,
          updatedAt: statistic.updatedAt,
          statisticDatas: statistic.statisticDatas,
          post: statistic.post,
          account: statistic.account,
          panelToStatistics: statistic.panelToStatistics,
          isActive: statistic.isActive,
        };

        return {
          statistic: statisticReadDto,
          statisticData: statisticData,
        };
      }),
    );

    return statisticsWithData;
  } catch (err) {
    this.logger.error(err);
    throw new InternalServerErrorException(
      'Ошибка при получении статистик с данными за период!',
    );
  }
  }
}
