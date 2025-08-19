import { Injectable } from '@nestjs/common';
import { Project } from 'src/domains/project.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ProjectRepository extends Repository<Project> {
  constructor(private dataSource: DataSource) {
    super(Project, dataSource.createEntityManager());
  }
}
