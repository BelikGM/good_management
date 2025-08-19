import { Injectable } from '@nestjs/common';
import { TargetHolder } from 'src/domains/targetHolder.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class TargetHolderRepository extends Repository<TargetHolder> {
  constructor(private dataSource: DataSource) {
    super(TargetHolder, dataSource.createEntityManager());
  }
}
