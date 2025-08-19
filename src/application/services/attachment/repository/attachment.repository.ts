import { Injectable } from '@nestjs/common';
import { Attachment } from 'src/domains/attachment.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class AttachmentRepository extends Repository<Attachment> {
  constructor(private dataSource: DataSource) {
    super(Attachment, dataSource.createEntityManager());
  }
}
