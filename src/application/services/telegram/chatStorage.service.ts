// src/modules/telegram/userStorage.ts

import { Injectable } from '@nestjs/common';
import { Telegraf } from 'telegraf';

@Injectable()
export class ChatStorageService {
  private chats: Map<number | '', any> = new Map();

  constructor(private readonly bot: Telegraf) {}

  setChatInfo(chatId: number | '', data: any) {
    this.chats.set(chatId, data);
  }

  getChatInfo(chatId: number | ''): any | undefined {
    return this.chats.get(chatId);
  }

  removeInfo(chatId: number | '') {
    this.chats.delete(chatId);
  }

  clearAllChats() {
    this.chats.clear();
  }

  clearChatById(chatId: number | '') {
    this.chats.delete(chatId);
  }
}
