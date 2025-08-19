import { Policy } from 'src/domains/policy.entity';

export class FileReadDto {
  id: string;
  fileName: string;
  path: string;
  size: number;
  mimetype: string;
  createdAt: Date;
  updatedAt: Date;
  policy?: Policy;
}
