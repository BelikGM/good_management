import { Injectable } from '@nestjs/common';
import { PanelToStatistic } from 'src/domains/panelToStatistic.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class PanelToStatisticRepository extends Repository<PanelToStatistic> {
  constructor(private dataSource: DataSource) {
    super(PanelToStatistic, dataSource.createEntityManager());
  }
}
