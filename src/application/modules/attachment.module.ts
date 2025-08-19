import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attachment } from 'src/domains/attachment.entity';
import { AttachmentService } from '../services/attachment/attachment.service';
import { AttachmentRepository } from '../services/attachment/repository/attachment.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Attachment])],
  providers: [AttachmentService, AttachmentRepository],
  exports: [AttachmentService],
})
export class AttachmentModule {}
