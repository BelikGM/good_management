import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from 'winston';
import { Attachment } from 'src/domains/attachment.entity';
import { AttachmentRepository } from './repository/attachment.repository';
import { AttachmentCreateDto } from 'src/contracts/attachment/create-attachment.dto';
import { createHash } from 'crypto';
import * as fs from 'fs';
import { AttachmentReadDto } from 'src/contracts/attachment/read-attachment.dto';
import { In } from 'typeorm';

@Injectable()
export class AttachmentService {
  constructor(
    @InjectRepository(Attachment)
    private readonly attachmentRepository: AttachmentRepository,
    @Inject('winston') private readonly logger: Logger,
  ) { }

  async findAllByIds(ids: string[]): Promise<AttachmentReadDto[]> {
    try {
      const attachments = await this.attachmentRepository.find({
        where: { id: In(ids) },
      });
      const foundIds = attachments.map((attachment) => attachment.id);
      const missingIds = ids.filter((id) => !foundIds.includes(id));
      if (missingIds.length > 0) {
        throw new NotFoundException(
          `Не найдены вложения с IDs: ${missingIds.join(', ')}`,
        );
      }
      return attachments.map((attachment) => ({
        id: attachment.id,
        attachmentName: attachment.attachmentName,
        attachmentPath: attachment.attachmentPath,
        attachmentSize: attachment.attachmentSize,
        attachmentMimetype: attachment.attachmentMimetype,
        originalName: attachment.originalName,
        hash: attachment.hash,
        createdAt: attachment.createdAt,
        updatedAt: attachment.updatedAt,
        attachmentToTargets: attachment.attachmentToTargets,
        attachmentToMessages: attachment.attachmentToMessages,
      }));
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new InternalServerErrorException('Ошибка при получении вложений!');
    }
  }

  async findOneByHash(fileHash: string): Promise<AttachmentReadDto | null> {
    try {
      const attachment = await this.attachmentRepository.findOne({
        where: { hash: fileHash },
      });
      if (attachment) return null;

      const attachmentReadDto: AttachmentReadDto = {
        id: attachment.id,
        attachmentName: attachment.attachmentName,
        attachmentPath: attachment.attachmentPath,
        attachmentSize: attachment.attachmentSize,
        attachmentMimetype: attachment.attachmentMimetype,
        originalName: attachment.originalName,
        hash: attachment.hash,
        createdAt: attachment.createdAt,
        updatedAt: attachment.updatedAt,
        attachmentToTargets: attachment.attachmentToTargets,
        attachmentToMessages: attachment.attachmentToMessages,
      };
      return attachmentReadDto;
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err
      };
      throw new InternalServerErrorException('Ошибка при получении вложения!');
    }
  }

  async create(attachmentCreateDto: AttachmentCreateDto): Promise<Attachment> {
    try {
      const attachment = new Attachment();
      attachment.attachmentName = attachmentCreateDto.attachmentName;
      attachment.attachmentPath = attachmentCreateDto.attachmentPath;
      attachment.attachmentSize = attachmentCreateDto.attachmentSize;
      attachment.attachmentMimetype = attachmentCreateDto.attachmentMimetype;
      attachment.originalName = attachmentCreateDto.originalName;
      attachment.hash = attachmentCreateDto.hash;

      return await this.attachmentRepository.save(attachment);
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при создании записи файла!',
      );
    }
  }

  async calculateFileHash(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = createHash('sha256');
      const stream = fs.createReadStream(filePath);

      stream.on('data', (chunk) => hash.update(chunk));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', (error) => reject(error));
    });
  }
}
