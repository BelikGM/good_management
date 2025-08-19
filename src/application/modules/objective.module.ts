import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Objective } from 'src/domains/objective.entity';
import { ObjectiveService } from '../services/objective/objective.service';
import { ObjectiveRepository } from '../services/objective/repository/objective.repository';
import { ObjectiveController } from 'src/controllers/objective.controller';
import { QueueModule } from './queue.module';
import { RoleSettingModule } from './roleSetting.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Objective]),
    forwardRef(() => QueueModule),
    RoleSettingModule,
  ],
  controllers: [ObjectiveController],
  providers: [ObjectiveService, ObjectiveRepository],
  exports: [ObjectiveService],
})
export class ObjectiveModule {}
