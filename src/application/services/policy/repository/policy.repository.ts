import { Injectable } from '@nestjs/common';
import { Policy } from 'src/domains/policy.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class PolicyRepository extends Repository<Policy> {
  constructor(private dataSource: DataSource) {
    super(Policy, dataSource.createEntityManager());
  }
}
