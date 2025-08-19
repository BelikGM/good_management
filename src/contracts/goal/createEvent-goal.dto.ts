export class GoalCreateEventDto {
  eventType: string;

  id: string;

  content: string[]; // Текстовые блоки цели

  createdAt: Date;

  organizationId: string;

  userId: string;

  accountId: string;
}
