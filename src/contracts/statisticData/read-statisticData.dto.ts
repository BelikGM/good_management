import { Statistic } from 'src/domains/statistic.entity';
import { CorrelationType } from 'src/domains/statisticData.entity';

export class StatisticDataReadDto {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  value: number;
  valueDate: Date;
  correlationType: CorrelationType;
  statistic: Statistic;
}
