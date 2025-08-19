import { Account } from 'src/domains/account.entity';
import { Strategy } from 'src/domains/strategy.entity';

export class ObjectiveReadDto {
  id: string;
  situation: string[];
  content: string[];
  rootCause: string[];
  createdAt: Date;
  updatedAt: Date;
  strategy: Strategy;
  account: Account;
}
