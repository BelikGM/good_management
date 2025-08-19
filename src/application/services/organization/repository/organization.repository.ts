import { Injectable } from '@nestjs/common';
import { Organization } from 'src/domains/organization.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class OrganizationRepository extends Repository<Organization> {
  constructor(private dataSource: DataSource) {
    super(Organization, dataSource.createEntityManager());
  }
}
