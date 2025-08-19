import { Injectable } from '@nestjs/common';
import { Strategy } from 'src/domains/strategy.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class StrategyRepository extends Repository<Strategy> {
  constructor(private dataSource: DataSource) {
    super(Strategy, dataSource.createEntityManager());
  }
}
