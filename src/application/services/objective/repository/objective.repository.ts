import { Injectable } from '@nestjs/common';
import { Objective } from 'src/domains/objective.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ObjectiveRepository extends Repository<Objective> {
  constructor(private dataSource: DataSource) {
    super(Objective, dataSource.createEntityManager());
  }
}
