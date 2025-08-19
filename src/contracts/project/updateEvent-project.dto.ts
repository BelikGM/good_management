import { TargetCreateEventDto } from '../target/createEvent-target.dto';
import { TargetUpdateEventDto } from '../target/updateEvent-target.dto';

export class ProjectUpdateEventDto {
  eventType: string;
  id: string;
  projectName: string | null;
  programId: string | null;
  content: string | null;
  updatedAt: Date;
  strategyId: string | null;
  targetUpdateDtos: TargetUpdateEventDto[] | null;
  targetCreateDtos: TargetCreateEventDto[] | null;
  accountId: string;
}

// не может быть активным пока нет 1 задачи "продукт" и 1 задачи "обычная"
