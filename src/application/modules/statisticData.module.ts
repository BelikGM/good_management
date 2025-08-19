import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StatisticData } from 'src/domains/statisticData.entity';
import { StatisticDataService } from '../services/statisticData/statisticData.service';
import { StatisticDataRepository } from '../services/statisticData/repository/statisticData.repository';

@Module({
  imports: [TypeOrmModule.forFeature([StatisticData])],
  providers: [StatisticDataService, StatisticDataRepository],
  exports: [StatisticDataService],
})
export class StatisticDataModule {}
