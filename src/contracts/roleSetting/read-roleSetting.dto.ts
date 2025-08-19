import { Account } from 'src/domains/account.entity';
import { Role } from 'src/domains/role.entity';
import { Modules } from 'src/domains/roleSetting.entity';

export class RoleSettingReadDto {
  id: string;
  module: Modules;
  can_read: boolean;
  can_create: boolean;
  can_update: boolean;
  createdAt: Date;
  updatedAt: Date;
  role: Role;
  account: Account;
}
