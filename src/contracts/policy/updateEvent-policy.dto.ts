export class PolicyUpdateEventDto {
  eventType: string;
  id: string;
  policyName: string | null;
  state: string | null;
  type: string | null;
  content: string | null;
  updatedAt: Date;
  accountId: string;
}
