import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConvertToPost } from 'src/domains/convertToPost.entity';
import { ConvertToPostService } from '../services/convertToPost/convertToPost.service';
import { ConvertToPostRepository } from '../services/convertToPost/repository/convertToPost.repository';
import { PostModule } from './post.module';

@Module({
  imports: [TypeOrmModule.forFeature([ConvertToPost]), PostModule],
  providers: [ConvertToPostService, ConvertToPostRepository],
  exports: [ConvertToPostService],
})
export class ConvertToPostModule {}
