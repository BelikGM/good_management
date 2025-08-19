import { Injectable } from '@nestjs/common';
import { Statistic } from 'src/domains/statistic.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class StatisticRepository extends Repository<Statistic> {
  constructor(private dataSource: DataSource) {
    super(Statistic, dataSource.createEntityManager());
  }
}
