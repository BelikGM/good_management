import {
  Headers,
  Controller,
  Get,
  OnModuleInit,
  HttpStatus,
  Query,
  Req,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { TelegramService } from './application/services/telegram/telegram.service';
import {
  ApiHeader,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './application/services/auth/auth.service';
import { Request as ExpressRequest } from 'express';
@ApiTags('Homepage')
@Controller()
export class AppController implements OnModuleInit {
  constructor(
    private readonly authService: AuthService,
    private readonly telegramBotService: TelegramService,
  ) { }

  @Get()
  @ApiOperation({ summary: 'Домашняя страница' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: {
      user_agent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36 OPR/112.0.0.0 (Edition Yx GX)',
      ip: '::1',
      tokenForTG: '7b96732ad3e8c42f69e3',
      code_challenge: 'yUTIHPqrEeWTVoHmYJkL5x9WAQGb3umfTrT3TxFPtSg',
      state: 'c0def372ed9f958837bf45cb10dbbd26',
      isLogged: false,
    },
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiHeader({
    name: 'User-Agent',
    required: true,
    description: 'Информация о браузере клиента',
  })
  @ApiQuery({
    name: 'fingerprint',
    required: false,
    description: 'Отпечаток браузера',
    example: '123rewt235r3wefe',
  })
  async getToken(
    @Req() req: ExpressRequest,
    @Headers('User-Agent') user_agent: string,
    @Query('fingerprint') fingerprint?: string,
  ): Promise<object> {
    let isLogged = false;
    let userId = null;
    const refreshTokenId = req.cookies['refresh-tokenId'];
    if (fingerprint && refreshTokenId) {
      const isLoggedResult = await this.authService.isSessionExpired(
        fingerprint,
        refreshTokenId,
      );
      isLogged = isLoggedResult.isExpired ? false : true;
      userId = isLogged ? isLoggedResult.userId : null;
    }
    // Генерация code_verifier
    const codeVerifier = this.generateCodeVerifier(128); // длина от 43 до 128 символов

    // Генерация code_challenge
    const codeChallenge = this.generateCodeChallenge(codeVerifier);

    // Генерация state
    const state = crypto.randomBytes(16).toString('hex'); // произвольная строка состояния

    const tokenForTG = crypto.randomBytes(10).toString('hex');

    return {
      user_agent,
      tokenForTG,
      codeVerifier,
      code_challenge: codeChallenge,
      state,
      isLogged,
      userId,
    };
  }

  onModuleInit() {
    this.telegramBotService.startBot();
  }

  // Метод для генерации code_verifier
  private generateCodeVerifier(length: number): string {
    const characters =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_-';
    let codeVerifier = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      codeVerifier += characters[randomIndex];
    }
    return codeVerifier;
  }

  // Метод для генерации code_challenge
  private generateCodeChallenge(codeVerifier: string): string {
    return crypto.createHash('sha256').update(codeVerifier).digest('base64url');
  }
}
