import { Injectable } from '@nestjs/common';
import { Message } from 'src/domains/message.entity';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class MessageRepository extends Repository<Message> {
  constructor(private dataSource: DataSource) {
    super(Message, dataSource.createEntityManager());
  }
}
