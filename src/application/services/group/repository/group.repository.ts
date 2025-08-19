import { Injectable } from '@nestjs/common';
import { Group } from 'src/domains/group.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class GroupRepository extends Repository<Group> {
  constructor(private dataSource: DataSource) {
    super(Group, dataSource.createEntityManager());
  }
}
