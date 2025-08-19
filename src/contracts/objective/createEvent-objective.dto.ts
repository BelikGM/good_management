export class ObjectiveCreateEventDto {
  eventType: string;
  id: string;
  situation: string[] | null;
  content: string[] | null;
  rootCause: string[] | null;
  createdAt: Date;
  strategyId: string;
  accountId: string;
}
