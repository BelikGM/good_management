import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from 'winston';
import { AttachmentService } from '../attachment/attachment.service';
import { AttachmentToMessageRepository } from './repository/attachmentToMessage.repository';
import { AttachmentToMessage } from 'src/domains/attachmentToMessage.entity';
import { Message } from 'src/domains/message.entity';
import { MessageReadDto } from 'src/contracts/message/read-message.dto';

@Injectable()
export class AttachmentToMessageService {
  constructor(
    @InjectRepository(AttachmentToMessage)
    private readonly attachmentToMessageRepository: AttachmentToMessageRepository,
    private readonly attachmentService: AttachmentService,
    @Inject('winston') private readonly logger: Logger,
  ) { }

  async createSeveral(
    message: Message,
    attachmentIds: string[],
  ): Promise<void> {
    try {
      const attachments =
        await this.attachmentService.findAllByIds(attachmentIds);

      const attachmentToMessages = attachments.map((attachment) => {
        const attachmentToMessage = new AttachmentToMessage();
        attachmentToMessage.message = message;
        attachmentToMessage.attachment = attachment;
        return attachmentToMessage;
      });
      await this.attachmentToMessageRepository.insert(attachmentToMessages);
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при связывании вложений с сообщением!',
      );
    }
  }

  async remove(message: MessageReadDto): Promise<void> {
    try {
      await this.attachmentToMessageRepository.delete({ message: message });
    }
    catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при удалении вложений!',
      );
    }
  }
}
