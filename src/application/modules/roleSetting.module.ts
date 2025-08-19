import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoleSetting } from 'src/domains/roleSetting.entity';
import { RoleSettingService } from '../services/roleSetting/roleSetting.service';
import { RoleSettingRepository } from '../services/roleSetting/repository/roleSetting.repository';
import { RoleSettingController } from 'src/controllers/roleSetting.controller';
import { RoleModule } from './role.module';

@Module({
  imports: [TypeOrmModule.forFeature([RoleSetting]), RoleModule],
  providers: [RoleSettingService, RoleSettingRepository],
  controllers: [RoleSettingController],
  exports: [RoleSettingService],
})
export class RoleSettingModule {}
