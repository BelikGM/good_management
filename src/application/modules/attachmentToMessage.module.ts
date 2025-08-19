import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttachmentToMessage } from 'src/domains/attachmentToMessage.entity';
import { AttachmentToMessageRepository } from '../services/attachmentToMessage/repository/attachmentToMessage.repository';
import { AttachmentToMessageService } from '../services/attachmentToMessage/attachmentToMessage.service';
import { AttachmentModule } from './attachment.module';

@Module({
  imports: [TypeOrmModule.forFeature([AttachmentToMessage]), AttachmentModule],
  providers: [AttachmentToMessageRepository, AttachmentToMessageService],
  exports: [AttachmentToMessageService],
})
export class AttachmentToMessageModule {}
