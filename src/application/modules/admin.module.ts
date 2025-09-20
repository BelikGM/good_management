import { Module } from '@nestjs/common';
import { AdminController } from 'src/controllers/admin.controller';
import { PolicyHtmlToMarkdownService } from 'src/application/services/policy/policy-html-to-markdown.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Policy } from 'src/domains/policy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Policy])],
  controllers: [AdminController],
  providers: [PolicyHtmlToMarkdownService],
})
export class AdminModule {}
