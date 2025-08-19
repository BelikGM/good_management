import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AttachmentToTarget } from 'src/domains/attachmentToTarget.entity';
import { Target } from 'src/domains/target.entity';
import { Logger } from 'winston';
import { AttachmentService } from '../attachment/attachment.service';
import { AttachmentToTargetRepository } from './repostitory/attachmentToTarget.repository';
import { TargetReadDto } from 'src/contracts/target/read-target.dto';

@Injectable()
export class AttachmentToTargetService {
  constructor(
    @InjectRepository(AttachmentToTarget)
    private readonly attachmentToTargetRepository: AttachmentToTargetRepository,
    private readonly attachmentService: AttachmentService,
    @Inject('winston') private readonly logger: Logger,
  ) { }

  async createSeveral(target: Target, attachmentIds: string[]): Promise<void> {
    try {
      const attachments =
        await this.attachmentService.findAllByIds(attachmentIds);

      const attachmentToTargets = attachments.map((attachment) => {
        const attachmentToTarget = new AttachmentToTarget();
        attachmentToTarget.target = target;
        attachmentToTarget.attachment = attachment;
        return attachmentToTarget;
      });
      await this.attachmentToTargetRepository.insert(attachmentToTargets);
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при связывании вложений с задачей!',
      );
    }
  }

  async remove(target: TargetReadDto): Promise<void> {
    try {
      await this.attachmentToTargetRepository.delete({ target: target });
    }
    catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при удалении вложений задачи!',
      );
    }
  }
}
