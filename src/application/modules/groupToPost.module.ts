import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GroupToPost } from 'src/domains/groupToPost.entity';
import { GroupToPostService } from '../services/groupToPost/groupToPost.service';
import { GroupToPostRepository } from '../services/groupToPost/repository/groupToPost.repository';
import { PostModule } from './post.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GroupToPost]),
    forwardRef(() => PostModule),
  ],
  providers: [GroupToPostService, GroupToPostRepository],
  exports: [GroupToPostService],
})
export class GroupToPostModule {}
