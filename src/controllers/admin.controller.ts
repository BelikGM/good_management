import { Controller, Post } from '@nestjs/common';
import { PolicyHtmlToMarkdownService } from 'src/application/services/policy/policy-html-to-markdown.service';

@Controller('admin') // ← это создает префикс /admin
export class AdminController {
  constructor(
    private readonly htmlToMarkdownService: PolicyHtmlToMarkdownService,
  ) {}

  @Post('convert-html-to-markdown') // ← полный путь: POST /admin/convert-html-to-markdown
  async convert() {
    await this.htmlToMarkdownService.convertAllHtmlToMarkdown();
    return { message: '✅ HTML успешно конвертирован в Markdown' };
  }
}
