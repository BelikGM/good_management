import { StatisticDataCreateEventDto } from '../statisticData/createEvent-statisticData.dto';
import { StatisticDataUpdateEventDto } from '../statisticData/updateEvent-statisticData.dto';

export class StatisticUpdateEventDto {
  eventType: string;
  id: string;
  type: string | null;
  name: string | null;
  description: string | null;
  updatedAt: Date;
  postId: string | null;
  statisticDataUpdateDtos?: StatisticDataUpdateEventDto[] | null;
  statisticDataCreateDtos?: StatisticDataCreateEventDto[] | null;
  accountId: string;
}
