import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role } from 'src/domains/role.entity';
import { RoleService } from '../services/role/role.service';
import { RoleRepository } from '../services/role/repository/role.repository';

@Module({
  imports: [TypeOrmModule.forFeature([Role])],
  providers: [RoleService, RoleRepository],
  exports: [RoleService],
})
export class RoleModule {}
