import { Module } from '@nestjs/common';
import { ControlPanelController } from 'src/controllers/controlPanel.controller';
import { ControlPanelService } from '../services/controlPanel/controlPanel.service';
import { ControlPanelRepository } from '../services/controlPanel/repository/controlPanel.repository';
import { OrganizationModule } from './organization.module';
import { PanelToStatisticModule } from './panelToStatistic.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ControlPanel } from 'src/domains/controlPanel.entity';
import { PostModule } from './post.module';
import { RoleSettingModule } from './roleSetting.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ControlPanel]),
    OrganizationModule,
    PanelToStatisticModule,
    RoleSettingModule,
    PostModule,
  ],
  controllers: [ControlPanelController],
  providers: [ControlPanelService, ControlPanelRepository],
  exports: [ControlPanelService],
})
export class ControlPanelModule {}
