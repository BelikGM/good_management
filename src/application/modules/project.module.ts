import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from 'src/domains/project.entity';
import { ProjectService } from '../services/project/project.service';
import { ProjectRepository } from '../services/project/repository/project.repository';
import { ProjectController } from 'src/controllers/project.controller';
import { StrategyModule } from './strategy.module';
import { TargetModule } from './target.module';
import { OrganizationModule } from './organization.module';
import { QueueModule } from './queue.module';
import { PostModule } from './post.module';
import { ConvertModule } from './convert.module';
import {MessageModule} from "./message.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Project]),
    PostModule,
    StrategyModule,
    TargetModule,
    OrganizationModule,
    forwardRef(() => QueueModule),
    ConvertModule,
      MessageModule
  ],
  controllers: [ProjectController],
  providers: [ProjectService, ProjectRepository],
})
export class ProjectModule {}
