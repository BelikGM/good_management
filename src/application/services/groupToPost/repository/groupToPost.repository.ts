import { Injectable } from '@nestjs/common';
import { GroupToPost } from 'src/domains/groupToPost.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class GroupToPostRepository extends Repository<GroupToPost> {
  constructor(private dataSource: DataSource) {
    super(GroupToPost, dataSource.createEntityManager());
  }
}
