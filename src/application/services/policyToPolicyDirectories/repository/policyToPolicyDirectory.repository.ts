import { Injectable } from '@nestjs/common';
import { PolicyToPolicyDirectory } from 'src/domains/policyToPolicyDirectories.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class PolicyToPolicyDirectoryRepository extends Repository<PolicyToPolicyDirectory> {
  constructor(private dataSource: DataSource) {
    super(PolicyToPolicyDirectory, dataSource.createEntityManager());
  }
}
