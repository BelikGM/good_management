import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { File } from 'src/domains/file.entity';
import { FileService } from '../services/file/file.service';
import { FileRepository } from '../services/file/repository/file.repository';

@Module({
  imports: [TypeOrmModule.forFeature([File])],
  providers: [FileService, FileRepository],
  exports: [FileService],
})
export class FileModule {}
