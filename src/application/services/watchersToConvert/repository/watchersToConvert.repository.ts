import { Injectable } from '@nestjs/common';
import { WatchersToConvert } from 'src/domains/watchersToConvert.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class WatchersToConvertRepository extends Repository<WatchersToConvert> {
  constructor(private dataSource: DataSource) {
    super(WatchersToConvert, dataSource.createEntityManager());
  }
}
