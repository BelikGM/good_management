import { Module } from '@nestjs/common';
import { RefreshService } from '../services/refreshSession/refresh.service';
import { RefreshSessionRepository } from '../services/refreshSession/Repository/refresh.repository';
import { RefreshSession } from 'src/domains/refreshSession.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([RefreshSession])],
  providers: [RefreshService, RefreshSessionRepository],
  exports: [RefreshService],
})
export class RefreshModule {}
