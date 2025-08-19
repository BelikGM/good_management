import { Injectable } from '@nestjs/common';
import { HistoryUsersToPost } from 'src/domains/historyUsersToPost.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class HistoryUsersToPostRepository extends Repository<HistoryUsersToPost> {
  constructor(private dataSource: DataSource) {
    super(HistoryUsersToPost, dataSource.createEntityManager());
  }
}
