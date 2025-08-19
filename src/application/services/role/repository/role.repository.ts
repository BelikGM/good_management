import { Injectable } from '@nestjs/common';
import { Role } from 'src/domains/role.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class RoleRepository extends Repository<Role> {
  constructor(private dataSource: DataSource) {
    super(Role, dataSource.createEntityManager());
  }
}
