import { Module } from '@nestjs/common';
import { TelegramService } from '../services/telegram/telegram.service';
import { UsersModule } from './users.module';
import { HttpModule } from '@nestjs/axios';
import { Telegraf } from 'telegraf';
import { ChatStorageService } from '../services/telegram/chatStorage.service';

@Module({
  imports: [UsersModule, HttpModule],
  providers: [TelegramService, Telegraf, ChatStorageService],
  exports: [TelegramService],
})
export class TelegramModule {}
