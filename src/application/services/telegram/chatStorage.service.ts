// src/modules/telegram/userStorage.ts

import { Injectable } from '@nestjs/common';
import { Telegraf } from 'telegraf';
export interface ChatInfo {
  token?: string;
  clientId?: string;
  messages?: number[]; // теперь хранит сообщения бота
}

@Injectable()
export class ChatStorageService {
  private chats: Map<number | '', ChatInfo> = new Map();

  setChatInfo(chatId: number | '', data: ChatInfo) {
    this.chats.set(chatId, data);
  }

  getChatInfo(chatId: number | ''): ChatInfo | undefined {
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

  addMessageId(chatId: number | '', messageId: number) {
    const chat = this.chats.get(chatId) || { messages: [] };
    if (!chat.messages) chat.messages = [];
    chat.messages.push(messageId);
    this.chats.set(chatId, chat);
  }
}
