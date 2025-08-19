import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PolicyDirectory } from 'src/domains/policyDirectory.entity';
import { PolicyToPolicyDirectoryModule } from './policyToPolicyDirectory.module';
import { PolicyDirectoryRepository } from '../services/policyDirectory/repository/policyDirectory.repository';
import { PolicyDirectoryService } from '../services/policyDirectory/policyDirectory.service';
import { PolicyDirectoryController } from 'src/controllers/policyDirectory.controller';
import { PolicyModule } from './policy.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([PolicyDirectory]),
    PolicyToPolicyDirectoryModule,
    PolicyModule,
  ],
  controllers: [PolicyDirectoryController],
  providers: [PolicyDirectoryService, PolicyDirectoryRepository],
  exports: [PolicyDirectoryService],
})
export class PolicyDirectoryModule {}
