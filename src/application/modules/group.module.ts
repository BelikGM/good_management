import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users.module';
import { GroupService } from '../services/group/group.service';
import { GroupRepository } from '../services/group/repository/group.repository';
import { Group } from 'src/domains/group.entity';
import { GroupToPostModule } from './groupToPost.module';
import { GroupController } from 'src/controllers/group.controller';
import { OrganizationModule } from './organization.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Group]),
    forwardRef(() => UsersModule),
    GroupToPostModule,
    OrganizationModule,
  ],
  controllers: [GroupController],
  providers: [GroupService, GroupRepository],
  exports: [GroupService],
})
export class GroupModule {}
