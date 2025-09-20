import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Policy } from 'src/domains/policy.entity';
import { PolicyService } from '../services/policy/policy.service';
import { PolicyRepository } from '../services/policy/repository/policy.repository';
import { PolicyController } from 'src/controllers/policy.controller';
import { OrganizationModule } from './organization.module';
import { RoleSettingModule } from './roleSetting.module';
import { QueueModule } from './queue.module';
import { PolicyHtmlToMarkdownService } from 'src/application/services/policy/policy-html-to-markdown.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Policy]),
    OrganizationModule,
    RoleSettingModule,
    forwardRef(() => QueueModule),
  ],
  controllers: [PolicyController],
  providers: [PolicyService, PolicyRepository, PolicyHtmlToMarkdownService],
  exports: [PolicyService],
})
export class PolicyModule {}
