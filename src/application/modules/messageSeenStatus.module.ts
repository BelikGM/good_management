import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessageSeenStatus } from 'src/domains/messageSeenStatus.entity';
import { MessageModule } from './message.module';
import { MessageSeenStatusRepository } from '../services/messageSeenStatus/repository/messageSeenStatus.repository';
import { MessageSeenStatusService } from '../services/messageSeenStatus/messageSeenStatus.service';

@Module({
  imports: [TypeOrmModule.forFeature([MessageSeenStatus]), MessageModule],
  providers: [MessageSeenStatusService, MessageSeenStatusRepository],
  exports: [MessageSeenStatusService],
})
export class MessageSeenStatusModule {}
