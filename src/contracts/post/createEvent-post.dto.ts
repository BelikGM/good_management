export class PostCreateEventDto {
  eventType: string;
  id: string;
  postName: string;
  divisionName: string | null;
  parentId: string | null;
  product: string;
  purpose: string;
  createdAt: Date;
  policyId: string;
  accountId: string;
  responsibleUserId: string | null;
  organizationId: string | null;
}
