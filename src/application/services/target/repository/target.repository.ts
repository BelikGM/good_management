import { Injectable } from '@nestjs/common';
import { Target } from 'src/domains/target.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class TargetRepository extends Repository<Target> {
  constructor(private dataSource: DataSource) {
    super(Target, dataSource.createEntityManager());
  }
}
