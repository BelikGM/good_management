export class PostUpdateEventDto {
  eventType: string;
  id: string;
  postName: string | null;
  divisionName: string | null;
  parentId: string | null;
  product: string | null;
  purpose: string | null;
  updatedAt: Date;
  policyId: string | null;
  responsibleUserId: string | null;
  accountId: string;
}
