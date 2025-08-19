import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { File } from 'src/domains/file.entity';
import { FileRepository } from './repository/file.repository';
import { Logger } from 'winston';
import { FileCreateDto } from 'src/contracts/file/create-file.dto';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: FileRepository,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async create(fileCreateDto: FileCreateDto): Promise<File> {
    try {
      const file = new File();
      file.fileName = fileCreateDto.fileName;
      file.path = fileCreateDto.path;
      file.size = fileCreateDto.size;
      file.mimetype = fileCreateDto.mimetype;

      return await this.fileRepository.save(file);
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException('Ошибка при создании файла!');
    }
  }
}
