import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Policy } from 'src/domains/policy.entity';
import { Repository } from 'typeorm';
const TurndownService = require('turndown'); // ⬅️ ключевая правка

@Injectable()
export class PolicyHtmlToMarkdownService {
  constructor(
    @InjectRepository(Policy)
    private readonly policyRepository: Repository<Policy>,
  ) {}

  private turndownService = new TurndownService();

  async convertAllHtmlToMarkdown(): Promise<void> {
    const policies = await this.policyRepository.find();

    for (const policy of policies) {
      if (policy.content) {
        const markdown = this.turndownService.turndown(policy.content);
        policy.content = markdown;
        await this.policyRepository.save(policy);
      }
    }

    console.log('✅ All policy contents converted from HTML to Markdown');
  }
}
