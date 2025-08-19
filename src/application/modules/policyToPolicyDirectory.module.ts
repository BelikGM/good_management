import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PolicyToPolicyDirectory } from 'src/domains/policyToPolicyDirectories.entity';
import { PolicyToPolicyDirectoryService } from '../services/policyToPolicyDirectories/policyToPolicyDirectory.service';
import { PolicyToPolicyDirectoryRepository } from '../services/policyToPolicyDirectories/repository/policyToPolicyDirectory.repository';
import { PolicyModule } from './policy.module';

@Module({
  imports: [TypeOrmModule.forFeature([PolicyToPolicyDirectory]), PolicyModule],
  providers: [
    PolicyToPolicyDirectoryService,
    PolicyToPolicyDirectoryRepository,
  ],
  exports: [PolicyToPolicyDirectoryService],
})
export class PolicyToPolicyDirectoryModule {}
