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
      const reportDayMinus6Days = new Date(reportDayTyped.getTime() - 6 * 24 * 60 * 60 * 1000);
      const statisticDatas = await this.statisticDataRepository
        .createQueryBuilder('statistic_data')
        .where('statistic_data.statisticId = :statisticId', { statisticId })
        .andWhere('statistic_data.valueDate <= :reportDayTyped', { reportDayTyped })
        .andWhere('statistic_data.valueDate >= :reportDayMinus6Days', { reportDayMinus6Days })
        .andWhere('statistic_data.correlationType IS NULL')
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

  async findMonthly(statisticId: string, datePoint: string): Promise<any[]> {
    try {
      const today = new Date(datePoint);
      const endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      const startDate = new Date(endDate);
      startDate.setFullYear(startDate.getFullYear() - 1, today.getMonth() - 1);

      const [monthlyPoints, regularPoints] = await Promise.all([
        this.statisticDataRepository
          .createQueryBuilder('statistic_data')
          .select([
            'statistic_data.id AS id',
            'EXTRACT(MONTH FROM statistic_data.valueDate) AS month',
            'EXTRACT(YEAR FROM statistic_data.valueDate) AS year',
            'CAST(SUM(statistic_data.value) AS FLOAT) AS total'
          ])
          .where('statistic_data.statisticId = :statisticId', { statisticId })
          .andWhere('statistic_data.valueDate BETWEEN :startDate AND :endDate', { startDate, endDate })
          .andWhere('statistic_data.correlationType = :type', { type: CorrelationType.MONTH })
          .groupBy('year, month, id')
          .getRawMany(),


        await this.statisticDataRepository
          .createQueryBuilder('statistic_data')
          .select([
            'EXTRACT(MONTH FROM statistic_data.valueDate) AS month',
            'EXTRACT(YEAR FROM statistic_data.valueDate) AS year',
            'EXTRACT(WEEK FROM statistic_data.valueDate) AS week',
            'statistic_data.correlationType AS correlationType',
            'CAST(SUM(statistic_data.value) AS FLOAT) AS total'
          ])
          .where('statistic_data.statisticId = :statisticId', { statisticId })
          .andWhere('statistic_data.valueDate BETWEEN :startDate AND :endDate', { startDate, endDate })
          .andWhere(new Brackets((qb) => {
            qb.where('statistic_data.correlationType IS NULL')
              .orWhere('statistic_data.correlationType = :type', { type: CorrelationType.WEEK })
          }))
          .groupBy('year, month, week, statistic_data.correlationType')
          .getRawMany()
      ])



      // КАКОГО ТО ХУЯ АЛИАС correlationtype хуета !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!11

      const weeklyCorrelationKeys = new Set(
        regularPoints
          .filter(rp => rp.correlationtype === CorrelationType.WEEK)
          .map(rp => `${rp.year}-${rp.week}`)
      );
      const regularWithoutCorrelationWeeks = regularPoints.filter(
        p => !weeklyCorrelationKeys.has(`${p.year}-${p.week}`)
      );

      const allPointsForAllMonths = regularWithoutCorrelationWeeks.concat(regularPoints.filter(rp => rp.correlationtype === CorrelationType.WEEK))

      const regularPointsSumForAllMonths = new Map<string, number>();
      allPointsForAllMonths.forEach(p => {
        if (regularPointsSumForAllMonths.has(`${p.year}-${p.month}`)) {
          const sum = regularPointsSumForAllMonths.get(`${p.year}-${p.month}`);
          regularPointsSumForAllMonths.set(`${p.year}-${p.month}`, sum + parseFloat(p.total));
        } else {
          regularPointsSumForAllMonths.set(`${p.year}-${p.month}`, parseFloat(p.total));
        }
      });

      const resultRegularPoints = [];
      for (let [key, value] of regularPointsSumForAllMonths) {
        resultRegularPoints.push({ year: key.slice(0, 4), month: key.slice(5), total: value })
      }

      const result = [];
      for (let i = 0; i < 13; i++) {
        const date = new Date(endDate.getFullYear(), endDate.getMonth(), 15); // ИЗ ЗА ЕБУЧЕГО ФЕВРАЛЯ НУЖНО СТАВИТЬ СЕРЕДИНУ МЕСЯЦА, т.к. при отнятии месяца с числом 30 до февраля не получалось дойти

        date.setMonth(date.getMonth() - i);

        const year = date.getFullYear();
        const month = date.getMonth() + 1;

        const monthlyPoint = monthlyPoints.find((p) => p.month == month && p.year == year);
        const regularPoint = resultRegularPoints.find((p) => p.month == month && p.year == year);
        result.push({
          year,
          month,
          total: monthlyPoint ? parseFloat(monthlyPoint.total) : (regularPoint ? parseFloat(regularPoint.total) : 0),
          correlationType: monthlyPoint ? true : false,
          id: monthlyPoint ? monthlyPoint.id : null
        });
      }

      return result.reverse();
    }
    catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException('Ошибка при получении точек!');
    }
  }


  async findYearly(statisticId: string, datePoint: string): Promise<any[]> {
    try {
      const today = new Date(datePoint);
      const endDate = new Date(today.getFullYear() + 1, 0, 0);
      const startDate = new Date(endDate);
      startDate.setFullYear(startDate.getFullYear() - 11, 0, 0);
      const [yearlyPoints, monthlyPoints, regularPoints] = await Promise.all([
        await this.statisticDataRepository
          .createQueryBuilder('statistic_data')
          .select([
            'statistic_data.id AS id',
            'EXTRACT(YEAR FROM statistic_data.valueDate) AS year',
            'CAST(SUM(statistic_data.value) AS FLOAT) AS total'
          ])
          .where('statistic_data.statisticId = :statisticId', { statisticId })
          .andWhere('statistic_data.valueDate BETWEEN :startDate AND :endDate', { startDate, endDate })
          .andWhere('statistic_data.correlationType = :type', { type: CorrelationType.YEAR })
          .groupBy('year, id')
          .getRawMany(),

        await this.statisticDataRepository
          .createQueryBuilder('statistic_data')
          .select([
            'EXTRACT(YEAR FROM statistic_data.valueDate) AS year',
            'EXTRACT(MONTH FROM statistic_data.valueDate) AS month',
            'CAST(SUM(statistic_data.value) AS FLOAT) AS total'
          ])
          .where('statistic_data.statisticId = :statisticId', { statisticId })
          .andWhere('statistic_data.valueDate BETWEEN :startDate AND :endDate', { startDate, endDate })
          .andWhere('statistic_data.correlationType = :type', { type: CorrelationType.MONTH })
          .groupBy('year, month')
          .getRawMany(),

        await this.statisticDataRepository
          .createQueryBuilder('statistic_data')
          .select([
            'EXTRACT(MONTH FROM statistic_data.valueDate) AS month',
            'EXTRACT(YEAR FROM statistic_data.valueDate) AS year',
            'EXTRACT(WEEK FROM statistic_data.valueDate) AS week',
            'statistic_data.correlationType AS correlationType',
            'CAST(SUM(statistic_data.value) AS FLOAT) AS total'
          ])
          .where('statistic_data.statisticId = :statisticId', { statisticId })
          .andWhere('statistic_data.valueDate BETWEEN :startDate AND :endDate', { startDate, endDate })
          .andWhere(new Brackets((qb) => {
            qb.where('statistic_data.correlationType IS NULL')
              .orWhere('statistic_data.correlationType = :type', { type: CorrelationType.WEEK })
          }))
          .groupBy('year, month, week, statistic_data.correlationType')
          .getRawMany()
      ])


      const monthlyKeys = new Set(
        monthlyPoints.map(mp => `${mp.year}-${mp.month}`)
      );
      const regularWithoutCorrelationMonths = regularPoints.filter(
        p => !monthlyKeys.has(`${p.year}-${p.month}`)
      );
      const weeklyCorrelationDates = regularWithoutCorrelationMonths
        .filter(rp => rp.correlationtype === CorrelationType.WEEK)
        .map(rp => `${rp.year}-${rp.week}`);

      const weeklyCorrelationKeys = new Set(weeklyCorrelationDates);
      const regularWithoutCorrelationWeeks = regularWithoutCorrelationMonths.filter(
        p => !weeklyCorrelationKeys.has(`${p.year}-${p.week}`)
      );

      const allPointsForAllYears = regularWithoutCorrelationWeeks.concat(monthlyPoints, weeklyCorrelationDates)

      const regularPointsSumPerYear = new Map<string, number>();
      allPointsForAllYears.forEach(p => {
        if (regularPointsSumPerYear.has(p.year)) {
          const sum = regularPointsSumPerYear.get(p.year);
          regularPointsSumPerYear.set(p.year, sum + p.total);
        } else {
          regularPointsSumPerYear.set(p.year, p.total);
        }
      });

      const resultRegularPoints = [];
      for (let [key, value] of regularPointsSumPerYear) {
        resultRegularPoints.push({ year: key, total: value })
      }


      const result = [];
      for (let i = 0; i < 12; i++) {
        const date = new Date(endDate);
        date.setFullYear(date.getFullYear() - i);
        const year = date.getFullYear();

        const yearlyPoint = yearlyPoints.find(p => p.year == year);
        const regularPoint = resultRegularPoints.find(p => p.year == year);

        result.push({
          year,
          total: yearlyPoint
            ? parseFloat(yearlyPoint.total)
            : (regularPoint ? parseFloat(regularPoint.total) : 0),
          correlationType: yearlyPoint ? true : false,
          id: yearlyPoint ? yearlyPoint.id : null
        });
      }

      return result.reverse();
    }
    catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException('Ошибка при получении точек!');
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
      if (statisticDataUpdateDto.value != null)
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
