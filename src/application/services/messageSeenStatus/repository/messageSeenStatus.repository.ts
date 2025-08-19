import { Injectable } from '@nestjs/common';
import { MessageSeenStatus } from 'src/domains/messageSeenStatus.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class MessageSeenStatusRepository extends Repository<MessageSeenStatus> {
  constructor(private dataSource: DataSource) {
    super(MessageSeenStatus, dataSource.createEntityManager());
  }
}
