import { Account } from 'src/domains/account.entity';
import { GroupToPost } from 'src/domains/groupToPost.entity';

export class GroupReadDto {
  id: string;
  groupName: string;
  groupNumber: number;
  createdAt: Date;
  updatedAt: Date;
  groupToPosts: GroupToPost[];
  account: Account;
}
