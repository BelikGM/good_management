import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from 'winston';
import { StatisticDataRepository } from './repository/statisticData.repository';
import { CorrelationType, StatisticData } from 'src/domains/statisticData.entity';
import { StatisticDataCreateDto } from 'src/contracts/statisticData/create-statisticData.dto';
import { StatisticDataUpdateDto } from 'src/contracts/statisticData/update-statisticData.dto';
import { StatisticDataReadDto } from 'src/contracts/statisticData/read-statisticData.dto';
import { Brackets } from 'typeorm';

@Injectable()
export class StatisticDataService {
  constructor(
    @InjectRepository(StatisticData)
    private readonly statisticDataRepository: StatisticDataRepository,
    @Inject('winston') private readonly logger: Logger,
  ) { }


  async findDaily(statisticId: string, datePoint: string): Promise<StatisticDataReadDto[]> {
      try {
        const reportDayTyped = new Date(datePoint.split(' ')[0]);
        reportDayTyped.setUTCHours(23, 59, 59, 999); // Конец дня

        const reportDayMinus6Days = new Date(reportDayTyped.getTime() - 6 * 24 * 60 * 60 * 1000);
        reportDayMinus6Days.setUTCHours(0, 0, 0, 0); // Начало дня

        const statisticDatas = await this.statisticDataRepository
          .createQueryBuilder('statistic_data')
          .where('statistic_data.statisticId = :statisticId', { statisticId })
          .andWhere('statistic_data.valueDate BETWEEN :reportDayMinus6Days AND :reportDayTyped', {
            reportDayMinus6Days,
            reportDayTyped,
          })
          .andWhere('statistic_data.correlationType IS NULL') // Только неагрегированные данные
          .orderBy('statistic_data.valueDate', 'ASC')
          .getMany();

        return statisticDatas.map((data) => ({
          id: data.id,
          value: data.value,
          valueDate: data.valueDate,
          correlationType: data.correlationType,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
          statistic: data.statistic,
        }));
      } catch (err) {
        this.logger.error(err);
        throw new InternalServerErrorException('Ошибка при получении точек!');
      }
    }

async findMonthly(statisticId: string, datePoint: string): Promise<any[]> {
  try {
    const baseDate = new Date(datePoint);
    const endDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0, 23, 59, 59, 999);
    const startDate = new Date(baseDate.getFullYear(), baseDate.getMonth() - 11, 1, 0, 0, 0, 0);

    const allData = await this.statisticDataRepository
      .createQueryBuilder('data')
      .where('data.statisticId = :statisticId', { statisticId })
      .andWhere('data.valueDate BETWEEN :startDate AND :endDate', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      })
      .getMany();

    const toNumber = (val: any): number => {
      if (val === null || val === undefined) return 0;
      if (typeof val === 'number') return val;
      if (typeof val === 'string') {
        const num = parseFloat(val.replace(/\s/g, ''));
        return isNaN(num) ? 0 : num;
      }
      return 0;
    };

    const results: any[] = [];

    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(baseDate.getFullYear(), baseDate.getMonth() - i, 1);
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth() + 1;

      const monthData = allData.filter(d => {
        const dDate = new Date(d.valueDate);
        return dDate.getFullYear() === year && dDate.getMonth() === (month - 1);
      });

      let total: number | null = null;
      let correlationType: CorrelationType | null = null;

      const monthlyCorrection = monthData.find(d => d.correlationType === CorrelationType.MONTH);
      if (monthlyCorrection) {
        total = toNumber(monthlyCorrection.value);
        correlationType = CorrelationType.MONTH;
      } else {
        const dailySum = monthData
          .filter(d => d.correlationType === null)
          .map(d => toNumber(d.value))
          .reduce((sum, val) => sum + val, 0);

        total = dailySum > 0 ? dailySum : null;
        correlationType = null;
      }

      results.push({
        year,
        month,  
        total,
        correlationType,
        id: null,
      });
    }

    return results;

  } catch (err) {
    this.logger.error('Ошибка в findMonthly:', err);
    throw new InternalServerErrorException('Ошибка при получении месячных данных!');
  }
}



  async findYearly(statisticId: string, datePoint: string): Promise<any[]> {
  try {
    const baseDate = new Date(datePoint);
    const endYear = baseDate.getFullYear();
    const startYear = endYear - 11;

    // 1. Получаем годовые коррекции (если есть)
    const yearlyPoints = await this.statisticDataRepository
      .createQueryBuilder('data')
      .select([
        'data.id AS id',
        'EXTRACT(YEAR FROM data.valueDate) AS year',
        'CAST(SUM(data.value) AS FLOAT) AS total',
      ])
      .where('data.statisticId = :statisticId', { statisticId })
      .andWhere('EXTRACT(YEAR FROM data.valueDate) BETWEEN :startYear AND :endYear', {
        startYear,
        endYear,
      })
      .andWhere('data.correlationType = :type', { type: CorrelationType.YEAR })
      .groupBy('year, data.id')
      .getRawMany();

    const result: any[] = [];

    for (let i = 0; i < 12; i++) {
      const year = endYear - i;

      const yearCorrection = yearlyPoints.find(p => +p.year === year);

      if (yearCorrection) {
        result.push({
          year,
          total: parseFloat(yearCorrection.total),
          correlationType: CorrelationType.YEAR,
          id: yearCorrection.id,
        });
      } else {
        // Считаем месячные данные вручную
        const monthlyDatePoint = new Date(year, 11, 31); // 31 декабря года
        const monthlyData = await this.findMonthly(statisticId, monthlyDatePoint.toISOString());

        const total = monthlyData.reduce((sum, item) => sum + (item.total || 0), 0);

        result.push({
          year,
          total: total > 0 ? total : null,
          correlationType: null,
          id: null,
        });
      }
    }

    return result.reverse(); // От старого к новому

  } catch (err) {
    this.logger.error('Ошибка в findYearly:', err);
    throw new InternalServerErrorException('Ошибка при получении годовых данных!');
  }
}

  async findSeveralWeeks(statisticId: string, datePoint: string, weeksCount: number): Promise<any[]> {
    try {
      const reportDayTyped = new Date(datePoint.split(' ')[0]);
      const weeksAgo = new Date(reportDayTyped);
      switch (weeksCount) {
        case 13:
          weeksAgo.setDate(weeksAgo.getDate() - (13 * 8));
          break;
        case 26:
          weeksAgo.setDate(weeksAgo.getDate() - (26 * 8));
          break;
        case 52:
          weeksAgo.setDate(weeksAgo.getDate() - (52 * 8));
          break;
      }
      const statisticDatas = await this.statisticDataRepository
        .createQueryBuilder('statistic_data')
        .where('statistic_data.statisticId = :statisticId', { statisticId })
        .andWhere('statistic_data.valueDate <= :reportDayTyped', { reportDayTyped })
        .andWhere('statistic_data.valueDate >= :weeksAgo', { weeksAgo })
        .andWhere(new Brackets((qb) => {
          qb.where('statistic_data.correlationType IS NULL')
            .orWhere('statistic_data.correlationType = :type', { type: CorrelationType.WEEK })
        }))
        .orderBy('statistic_data.valueDate', 'ASC')
        .getMany()




      return statisticDatas.map((data) => ({
        id: data.id,
        value: data.value,
        valueDate: data.valueDate,
        correlationType: data.correlationType,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
        statistic: data.statistic
      }));
    }
    catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException('Ошибка при получении точек!');
    }
  }

  // async create(
  //   statisticDataCreateDto: StatisticDataCreateDto,
  // ): Promise<string> {
  //   try {
  //     const statisticData = new StatisticData();
  //     statisticData.value = statisticDataCreateDto.value;
  //     statisticData.valueDate = statisticDataCreateDto.valueDate;
  //     statisticData.correlationType = statisticDataCreateDto.correlationType;
  //     statisticData.statistic = statisticDataCreateDto.statistic;
  //     const createdStatisticDataId =
  //       await this.statisticDataRepository.insert(statisticData);

  //     return createdStatisticDataId.identifiers[0].id;
  //   } catch (err) {
  //     this.logger.error(err);
  //     throw new InternalServerErrorException('Ошибка при создании данных!');
  //   }
  // }

  async create(
  statisticDataCreateDto: StatisticDataCreateDto,
): Promise<string> {
  try {
    const query = this.statisticDataRepository
      .createQueryBuilder('statisticData')
      .where('DATE(statisticData.valueDate) = DATE(:valueDate)', {
        valueDate: statisticDataCreateDto.valueDate
      })
      .andWhere('statisticData.statistic = :statisticId', {
        statisticId: statisticDataCreateDto.statistic.id,
      });

    // Особое сравнение для NULL
    if (statisticDataCreateDto.correlationType === null) {
      query.andWhere('statisticData.correlationType IS NULL');
    } else {
      query.andWhere('statisticData.correlationType = :correlationType', {
        correlationType: statisticDataCreateDto.correlationType,
      });
    }

    const existingData = await query.getOne();

    if (existingData) {
      throw new BadRequestException(
        'Запись с указанной датой и типом корреляции уже существует.',
      );
    }

    const statisticData = new StatisticData();
    statisticData.value = statisticDataCreateDto.value;
    statisticData.valueDate = statisticDataCreateDto.valueDate;
    statisticData.correlationType = statisticDataCreateDto.correlationType;
    statisticData.statistic = statisticDataCreateDto.statistic;
    
    const createdStatisticDataId = await this.statisticDataRepository.insert(statisticData);
    return createdStatisticDataId.identifiers[0].id;
  } catch (err) {
    if (err instanceof BadRequestException) {
      throw err;
    }
    this.logger.error(err);
    throw new InternalServerErrorException('Ошибка при создании данных!');
  }
}

  async update(
    statisticDataUpdateDto: StatisticDataUpdateDto,
  ): Promise<string> {
    try {
      const statisticData = await this.statisticDataRepository.findOne({
        where: { id: statisticDataUpdateDto._id },
      });
      if (!statisticData) {
        throw new NotFoundException(
          `Данные с ID ${statisticDataUpdateDto._id} не найдены`,
        );
      }
      //if (statisticDataUpdateDto.value != null)
        statisticData.value = statisticDataUpdateDto.value;
      if (statisticDataUpdateDto.valueDate)
        statisticData.valueDate = statisticDataUpdateDto.valueDate;
      if (statisticDataUpdateDto.correlationType !== undefined)
        statisticData.correlationType = statisticDataUpdateDto.correlationType;
      await this.statisticDataRepository.update(statisticData.id, {
        value: statisticData.value,
        valueDate: statisticData.valueDate,
        correlationType: statisticData.correlationType,
      });
      return statisticData.id;
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new InternalServerErrorException(
        'Ошибка при обновлении данных статистики',
      );
    }
  }
}
