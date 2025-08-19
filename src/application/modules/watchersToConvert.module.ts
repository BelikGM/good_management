import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WatchersToConvert } from 'src/domains/watchersToConvert.entity';
import { WatchersToConvertRepository } from '../services/watchersToConvert/repository/watchersToConvert.repository';
import { WatchersToConvertService } from '../services/watchersToConvert/watchersToConvert.service';
import { PostModule } from './post.module';

@Module({
  imports: [TypeOrmModule.forFeature([WatchersToConvert]), PostModule],
  providers: [WatchersToConvertRepository, WatchersToConvertService],
  exports: [WatchersToConvertService],
})
export class WatchersToConvertModule {}
