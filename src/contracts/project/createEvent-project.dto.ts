import { TargetCreateEventDto } from '../target/createEvent-target.dto';

export class ProjectCreateEventDto {
  eventType: string;
  id: string;
  projectName: string;
  programId: string | null;
  content: string | null;
  type: string;
  organizationId: string; // Ids организаций, с которыми связать проект. У меня проект и организация M:M.
  createdAt: Date;
  strategyId: string | null;
  accountId: string;
  userId: string;
  targetCreateDtos: TargetCreateEventDto[] | null;
}

// не может быть активным пока нет 1 задачи "продукт" и 1 задачи "обычная"
