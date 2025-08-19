export class GoalUpdateEventDto {
  eventType: string;

  id: string;

  content: string[]; // Текстовые блоки цели

  updatedAt: Date;

  accountId: string;
}
