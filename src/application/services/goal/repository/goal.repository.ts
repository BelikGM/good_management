import { Injectable } from '@nestjs/common';
import { Goal } from 'src/domains/goal.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class GoalRepository extends Repository<Goal> {
  constructor(private dataSource: DataSource) {
    super(Goal, dataSource.createEntityManager());
  }
}
