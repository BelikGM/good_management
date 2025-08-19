export class PolicyCreateEventDto {
  eventType: string;
  id: string;
  policyName: string;
  state: string;
  type: string;
  content: string;
  createdAt: Date;
  userId: string;
  accountId: string;
  organizationId: string; // Ids организаций, с которыми связать политику. У меня политика и организации M:M.
}
