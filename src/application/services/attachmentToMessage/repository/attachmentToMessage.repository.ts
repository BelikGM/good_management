import { Injectable } from '@nestjs/common';
import { AttachmentToMessage } from 'src/domains/attachmentToMessage.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class AttachmentToMessageRepository extends Repository<AttachmentToMessage> {
  constructor(private dataSource: DataSource) {
    super(AttachmentToMessage, dataSource.createEntityManager());
  }
}
