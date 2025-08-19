import { Module } from '@nestjs/common';
import { PanelToStatisticService } from '../services/panelToStatistic/panelToStatistic.service';
import { PanelToStatisticRepository } from '../services/panelToStatistic/repository/panelToStatistic.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PanelToStatistic } from 'src/domains/panelToStatistic.entity';
import { StatisticModule } from './statistic.module';
import { PanelToStatisticController } from 'src/controllers/panelToStatistic.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PanelToStatistic]), StatisticModule],
  controllers: [PanelToStatisticController],
  providers: [PanelToStatisticService, PanelToStatisticRepository],
  exports: [PanelToStatisticService],
})
export class PanelToStatisticModule {}
