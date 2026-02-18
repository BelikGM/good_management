import { StatisticDataCreateEventDto } from '../statisticData/createEvent-statisticData.dto';

export class StatisticCreateEventDto {
  eventType: string;
  id: string;
  type: string;
  name: string;
  description: string | null;
  createdAt: Date;
  postId: string;
  accountId: string;
  statisticDataCreateDtos?: StatisticDataCreateEventDto[];
}
