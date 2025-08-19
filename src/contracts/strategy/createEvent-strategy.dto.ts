export class StrategyCreateEventDto {
  eventType: string;
  id: string;
  content: string;
  userId: string;
  accountId: string;
  organizationId: string; // Ids организаций, с которыми связать стратегию. У меня стратегия и организация M:M.
}
