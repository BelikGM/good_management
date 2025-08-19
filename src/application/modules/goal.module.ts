import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Goal } from 'src/domains/goal.entity';
import { GoalService } from '../services/goal/goal.service';
import { GoalRepository } from '../services/goal/repository/goal.repository';
import { GoalController } from 'src/controllers/goal.controller';
import { OrganizationModule } from './organization.module';
import { QueueModule } from './queue.module';
import { RoleSettingModule } from './roleSetting.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Goal]),
    OrganizationModule,
    RoleSettingModule,
    forwardRef(() => QueueModule),
  ],
  controllers: [GoalController],
  providers: [GoalService, GoalRepository],
})
export class GoalModule {}
