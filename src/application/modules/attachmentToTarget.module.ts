import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttachmentToTarget } from 'src/domains/attachmentToTarget.entity';
import { AttachmentToTargetRepository } from '../services/attachmentToTarget/repostitory/attachmentToTarget.repository';
import { AttachmentToTargetService } from '../services/attachmentToTarget/attachmentToTarget.service';
import { AttachmentModule } from './attachment.module';

@Module({
  imports: [TypeOrmModule.forFeature([AttachmentToTarget]), AttachmentModule],
  providers: [AttachmentToTargetRepository, AttachmentToTargetService],
  exports: [AttachmentToTargetService],
})
export class AttachmentToTargetModule {}
