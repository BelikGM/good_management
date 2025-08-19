import { Injectable } from '@nestjs/common';
import { File } from 'src/domains/file.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class FileRepository extends Repository<File> {
  constructor(private dataSource: DataSource) {
    super(File, dataSource.createEntityManager());
  }
}
