import { Injectable } from '@nestjs/common';
import { RoleSetting } from 'src/domains/roleSetting.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class RoleSettingRepository extends Repository<RoleSetting> {
  constructor(private dataSource: DataSource) {
    super(RoleSetting, dataSource.createEntityManager());
  }
}
