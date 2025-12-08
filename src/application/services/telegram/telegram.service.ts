import {
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Telegraf } from 'telegraf';
import { UsersService } from '../users/users.service';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ChatStorageService } from './chatStorage.service';
import { Logger } from 'winston';
import { ReadUserDto } from 'src/contracts/user/read-user.dto';

@Injectable()
export class TelegramService {
  constructor(
    private readonly bot: Telegraf,
    private readonly httpService: HttpService,
    private readonly usersService: UsersService,
    private readonly chatStorageService: ChatStorageService,
    @Inject('winston') private readonly logger: Logger,
  ) {
    if (!process.env.BOT_TOKEN)
      throw new Error('"BOT_TOKEN" env var is required!');
    this.bot = new Telegraf(process.env.BOT_TOKEN);
  }

  startBot() {

    // --- Обработка /start ---
    this.bot.start(async (ctx) => {
      try {
        if (!ctx.message.text.startsWith('/start')) {
          return ctx.reply(
            'Взаимодействие с ботом возможно только через ссылку на главном экране приложения!',
          );
        }

        const chatId = ctx.update.message?.chat.id || '';
        const match = ctx.message.text.match(/^\/start ([\w-]+)$/);

        if (!match) {
          return ctx.reply(
            'Команда /start не соответствует ожидаемому формату, пожалуйста, используйте QR - код или ссылку из приложения!',
          );
        }

        const command = match[1].replace('/start', '');
        const dashIndex = command.indexOf('-');
        const token = command.slice(0, dashIndex);
        const clientId = command.slice(dashIndex + 1);

        if (!token) {
          return ctx.reply(
            'Пожалуйста, используйте QR - код или ссылку из приложения!',
          );
        }

        const telegramId = ctx.message.from.id;
        const user = await this.usersService.findOneByTelegramId(telegramId);

        // --- Очистка всех предыдущих сообщений бота (новая сессия) ---
        const chat = this.chatStorageService.getChatInfo(chatId);
        if (chat?.messages) {
          for (const messageId of chat.messages) {
            await ctx.deleteMessage(messageId).catch(() => {});
          }
        }
        this.chatStorageService.clearChatById(chatId);

        if (user) {
          // --- Отправка новых сообщений бота ---
          const welcomeMsg = await ctx.reply(
            'Привет, я бот для регистрации в GoodManagement!',
          );
          this.chatStorageService.addMessageId(chatId, welcomeMsg.message_id);

          const stickerMsg = await ctx.replyWithSticker(
            'CAACAgIAAxkBAAEUfY9pNoYQWbFg-0DT-awSsE8EM1PofwACIYIAAhDFuEmHfIHDf-z_VTYE',
          );
          this.chatStorageService.addMessageId(chatId, stickerMsg.message_id);

          const authFlag = await this.authRequest(user, telegramId, token, clientId, ctx);
          if (authFlag) {
            const successMsg = await ctx.reply('Вход успешен!');
            this.chatStorageService.addMessageId(chatId, successMsg.message_id);
          }

        } else {
          // --- Если пользователя нет, сохраняем токен и clientId и просим поделиться контактом ---
          this.chatStorageService.setChatInfo(chatId, {
            token,
            clientId,
            messages: [],
          });
          const promptMsg = await ctx.reply(
            'Добро пожаловать в бота, чтобы войти поделитесь контактом, нажав на кнопку ниже:',
            {
              reply_markup: {
                keyboard: [[{ text: 'Поделиться контактом', request_contact: true }]],
                resize_keyboard: true,
                one_time_keyboard: true,
              },
            },
          );
          this.chatStorageService.addMessageId(chatId, promptMsg.message_id);
        }

      } catch (err) {
        this.logger.error(err);
      }
    });

    // --- Обработка контакта ---
    this.bot.on('contact', async (ctx) => {
      try {
        const chatId = ctx.update.message?.chat.id;
        const telephoneNumber = this.formatPhoneNumber(ctx.message.contact.phone_number);
        const telegramId = Number(ctx.message.contact.user_id);
        const chat = this.chatStorageService.getChatInfo(chatId);

        if (!chat?.token) {
          return ctx.reply(
            'Пожалуйста, используйте QR - код или ссылку из приложения!',
          );
        }

        const user = await this.usersService.findOneByTelephoneNumber(telephoneNumber)
          .catch((err) => (err instanceof NotFoundException ? null : null));

        // --- Очистка всех предыдущих сообщений бота ---
        if (chat?.messages) {
          for (const messageId of chat.messages) {
            await ctx.deleteMessage(messageId).catch(() => {});
          }
        }
        this.chatStorageService.clearChatById(chatId);

        if (user) {
          const authFlag = await this.authRequest(user, telegramId, chat.token, chat.clientId, ctx);
          if (authFlag) {
            const successMsg = await ctx.reply('Вход успешен!');
            this.chatStorageService.addMessageId(chatId, successMsg.message_id);
          }
        } else {
          const errorMsg = await ctx.reply(
            'Похоже вы используете не тот номер, на который был зарегистрирован ваш аккаунт в академии. Пожалуйста, используйте номер, который был указан при регистрации.',
          );
          this.chatStorageService.addMessageId(chatId, errorMsg.message_id);
        }

      } catch (err) {
        this.logger.error(err);
      }
    });

    this.bot.launch();
  }

  formatPhoneNumber(phoneNumber: string): string {
    if (!phoneNumber.startsWith('+')) {
      phoneNumber = '+' + phoneNumber;
    }
    return phoneNumber;
  }

  async authRequest(
    user: ReadUserDto,
    telegramId: number,
    token: string,
    clientId: string,
    ctx: any,
  ): Promise<any> {
    try {
      await firstValueFrom(
        this.httpService.post(
          process.env.NODE_ENV === 'dev'
            ? `${process.env.API_HOST}/auth/login/tg`
            : `${process.env.PROD_API_HOST}/auth/login/tg`,
          { user, telegramId, clientId, token },
        ),
      );
      return true;
    } catch (error) {
      if (error.response && (error.response.status === 400 || error.response.status === 401)) {
        this.logger.error(error);
        ctx.reply('Попробуйте войти еще раз!');
      } else if (error.response && (error.response.status === 404 || error.response.status === 500)) {
        this.logger.error(error);
        ctx.reply('Ой, что - то пошло не так!');
      }
    }
  }
}