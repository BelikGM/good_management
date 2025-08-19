import { Injectable } from '@nestjs/common';
import { ConvertToPost } from 'src/domains/convertToPost.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ConvertToPostRepository extends Repository<ConvertToPost> {
  constructor(private dataSource: DataSource) {
    super(ConvertToPost, dataSource.createEntityManager());
  }
}
