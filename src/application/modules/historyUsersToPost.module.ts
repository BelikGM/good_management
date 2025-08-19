import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoryUsersToPost } from 'src/domains/historyUsersToPost.entity';
import { HistoryUsersToPostService } from '../services/historyUsersToPost/historyUsersToPost.service';
import { HistoryUsersToPostRepository } from '../services/historyUsersToPost/repository/historyUsersToPost.repository';

@Module({
  imports: [TypeOrmModule.forFeature([HistoryUsersToPost])],
  providers: [HistoryUsersToPostService, HistoryUsersToPostRepository],
  exports: [HistoryUsersToPostService],
})
export class HistoryUsersToPostModule {}
