import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Convert } from 'src/domains/convert.entity';
import { ConvertService } from '../services/convert/convert.service';
import { ConvertRepository } from '../services/convert/repository/convert.repository';
import { ConvertToPostModule } from './convertToPost.module';
import { ConvertController } from 'src/controllers/convert.controller';
import { PostModule } from './post.module';
import { EventsModule } from './events.module';
import { TargetModule } from './target.module';
import { MessageModule } from './message.module';
import { WatchersToConvertModule } from './watchersToConvert.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Convert]),
    ConvertToPostModule,
    PostModule,
    TargetModule,
    WatchersToConvertModule,
    forwardRef(() => MessageModule),
    forwardRef(() => EventsModule),
  ],
  controllers: [ConvertController],
  providers: [ConvertService, ConvertRepository],
  exports: [ConvertService],
})
export class ConvertModule {}
