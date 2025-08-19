import { CorrelationType } from 'src/domains/statisticData.entity';

export class StatisticDataCreateEventDto {
  id: string;
  value: number;
  valueDate: Date;
  createdAt: Date;
  correlationType: CorrelationType | null;
  statisticId: string;
  accountId: string;
}
