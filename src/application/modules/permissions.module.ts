import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionService } from '../services/permissions/permission.service';
import { PermissionController } from 'src/controllers/permission.controller';
import { Post } from 'src/domains/post.entity';
import { RoleSetting } from 'src/domains/roleSetting.entity';
import { ApiProperty } from '@nestjs/swagger';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post, RoleSetting]),
  ],
  providers: [PermissionService],
  controllers: [PermissionController],
})
export class PermissionsModule {}
