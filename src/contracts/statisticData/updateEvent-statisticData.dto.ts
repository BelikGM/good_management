import { CorrelationType } from 'src/domains/statisticData.entity';

export class StatisticDataUpdateEventDto {
  id: string;
  value: number | null;
  valueDate: Date | null;
  correlationType: CorrelationType | null;
  updatedAt: Date;
  statisticId: string;
  accountId: string;
}
