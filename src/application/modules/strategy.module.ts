import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Strategy } from 'src/domains/strategy.entity';
import { StrategyService } from '../services/strategy/strategy.service';
import { StrategyRepository } from '../services/strategy/repository/strategy.repository';
import { StrategyController } from 'src/controllers/strategy.controller';
import { OrganizationModule } from './organization.module';
import { QueueModule } from './queue.module';
import { ObjectiveModule } from './objective.module';
import { RoleSettingModule } from './roleSetting.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Strategy]),
    OrganizationModule,
    ObjectiveModule,
    RoleSettingModule,
    forwardRef(() => QueueModule),
  ],
  controllers: [StrategyController],
  providers: [StrategyService, StrategyRepository],
  exports: [StrategyService],
})
export class StrategyModule {}
