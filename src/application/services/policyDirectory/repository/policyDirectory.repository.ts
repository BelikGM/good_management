import { Injectable } from '@nestjs/common';
import { PolicyDirectory } from 'src/domains/policyDirectory.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class PolicyDirectoryRepository extends Repository<PolicyDirectory> {
  constructor(private dataSource: DataSource) {
    super(PolicyDirectory, dataSource.createEntityManager());
  }
}
