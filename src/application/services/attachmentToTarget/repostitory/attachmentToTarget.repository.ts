import { Injectable } from '@nestjs/common';
import { AttachmentToTarget } from 'src/domains/attachmentToTarget.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class AttachmentToTargetRepository extends Repository<AttachmentToTarget> {
  constructor(private dataSource: DataSource) {
    super(AttachmentToTarget, dataSource.createEntityManager());
  }
}
