import { Injectable } from '@nestjs/common';
import { Convert } from 'src/domains/convert.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class ConvertRepository extends Repository<Convert> {
  constructor(private dataSource: DataSource) {
    super(Convert, dataSource.createEntityManager());
  }
}
