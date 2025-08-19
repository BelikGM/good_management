import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TargetHolder } from 'src/domains/targetHolder.entity';
import { TargetHolderRepository } from '../services/targetHolder/repository/targetHolder.repository';
import { TargetHolderService } from '../services/targetHolder/targetHolder.service';
import { TargetHolderController } from 'src/controllers/targetHolder.controller';

@Module({
  imports: [TypeOrmModule.forFeature([TargetHolder])],
  controllers: [TargetHolderController],
  providers: [TargetHolderService, TargetHolderRepository],
  exports: [TargetHolderService],
})
export class TargetHolderModule {}
