import { Injectable } from '@nestjs/common';
import { StatisticData } from 'src/domains/statisticData.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class StatisticDataRepository extends Repository<StatisticData> {
  constructor(private dataSource: DataSource) {
    super(StatisticData, dataSource.createEntityManager());
  }
}
