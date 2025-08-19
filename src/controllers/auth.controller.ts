import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UnprocessableEntityException,
  Req,
  Ip,
  Res,
  Headers,
  UseGuards,
  HttpStatus,
  UnauthorizedException,
  Inject,
  BadRequestException,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { Response as ExpressResponse } from 'express';
import { UserVkAuthDto } from '../contracts/user/user-vkauth-dto';
import { AuthVK } from '../contracts/auth-vk.dto';
import { AuthService } from '../application/services/auth/auth.service';
import { UsersService } from '../application/services/users/users.service';
import { AccessTokenGuard } from 'src/guards/accessToken.guard';
import { EventsGateway } from 'src/gateways/events.gateway';

import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthTG } from 'src/contracts/auth-tg.dto';
import { Logger } from 'winston';
import { UpdateUserDto } from 'src/contracts/user/update-user.dto';
import { UpdateVkAuthUserDto } from 'src/contracts/user/update-vkauthUser.dto';
import { refreshTokensExample } from 'src/constants/swagger-examples/auth/auth-examples';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly eventsGateway: EventsGateway,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  @Post('/login/vk')
  @ApiOperation({ summary: 'Войти через ВК' })
  @ApiBody({
    description: 'ДТО для логина',
    type: AuthVK,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: {},
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  async vk(
    @Headers('User-Agent') user_agent: string,
    @Body(new ValidationPipe()) auth: AuthVK,
    @Req() req: Request,
    @Ip() ip: string,
    @Res({ passthrough: true }) res: ExpressResponse,
  ): Promise<UserVkAuthDto> {
    let authData;
    try {
      authData = await this.authService.getVkToken(auth);
    } catch (err) {
      console.log(err);
      throw new UnprocessableEntityException('Wrong VK code');
    }
    console.log(JSON.stringify(authData.data));
    const userData = await this.authService.getUserDataFromVk(
      authData.data.access_token,
    );
    console.log(JSON.stringify(`+${userData.data.user.phone}`));
    console.log(JSON.stringify(userData.data));
    const _user = await this.userService.findOneByTelephoneNumber(
      `+${userData.data.user.phone}`,
    );
    let updatedUser = _user;
    if (_user) {
      if (_user.vk_id) {
        const updateVkAuthUserDto: UpdateVkAuthUserDto = {
          vk_id: userData.data.user.user_id,
          avatar_url: userData.data.user.avatar,
        };
        updatedUser = await this.userService.updateVkAuth(
          _user,
          updateVkAuthUserDto,
        );
      }
      const authenticateResult = await this.authService.authenticateVK(
        updatedUser,
        ip,
        user_agent,
        auth.fingerprint,
      );
      res.cookie('refresh-tokenId', authenticateResult.refreshTokenId, {
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'prod' ? true : false,
        maxAge: Number(process.env.COOKIE_EXPIRESIN),
        sameSite: process.env.NODE_ENV === 'prod' ? 'strict' : 'lax',
      });
      return authenticateResult._user;
    } else {
      throw new BadRequestException(
        'Аккаунт на такой номер не найден! Пожалуйста, используйте номер, под которым вы регистрировались!',
      );
    }

    // try {
    //     const { data } = await this.authService.getUserDataFromVk(
    //         authData.data.user_id,
    //         authData.data.access_token
    //     );

    //     const profile = data.response[0];
    //     let user: CreateUserDto = {
    //         vk_id: authData.data.user_id,
    //         firstName: `${profile.first_name}`,
    //         lastName: `${profile.last_name}`,
    //         avatar_url: profile.photo_400,
    //         telephoneNumber: profile.mobile_phone ? profile.mobile_phone : null
    //     };
    //     const newUser = await this.userService.create(user);
    //     const authenticateResult = await this.authService.authenticateVK(newUser, ip, user_agent, auth.fingerprint);
    //     res.cookie('refresh-tokenId', authenticateResult.refreshTokenId, { httpOnly: true })
    //     return authenticateResult._user
    // } catch (err) {
    //     console.log(err);
    //     throw new UnprocessableEntityException(err);
    // }
  }

  // @UseGuards(RefreshTokenGuard)
  @Post('refresh-tokens')
  @ApiOperation({ summary: 'Обновить токены' })
  @ApiBody({
    description: 'Данные для аутентификации',
    type: String,
    schema: {
      type: 'object',
      properties: {
        fingerprint: {
          type: 'string',
          description: 'Уникальный идентификатор устройства',
        },
      },
      required: ['fingerprint'],
    },
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'CREATED!',
    example: refreshTokensExample,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Войдите в свой аккаунт для дальнейшей работы!',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description:
      'Ваша сессия истекла, пожалуйста, войдите еще раз в свой аккаунт.',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  async refreshTokens(
    @Body() fingerprint: string,
    @Req() req: ExpressRequest,
    @Res({ passthrough: true }) res: ExpressResponse,
  ): Promise<{ newAccessToken: string }> {
    const refreshTokenId = req.cookies['refresh-tokenId'];
    const data = await this.authService.updateTokens(
      req.body.fingerprint,
      refreshTokenId,
    );
    res.cookie('refresh-tokenId', data.newRefreshTokenId, {
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'prod' ? true : false,
      maxAge: Number(process.env.COOKIE_EXPIRESIN),
      sameSite: process.env.NODE_ENV === 'prod' ? 'strict' : 'lax',
    });
    return { newAccessToken: data.newAccessToken };
  }

  @UseGuards(AccessTokenGuard)
  @Post('logout')
  @ApiOperation({ summary: 'Выход' })
  @ApiBody({
    description: 'Данные для выхода',
    type: String,
    schema: {
      type: 'object',
      properties: {
        fingerprint: {
          type: 'string',
          description: 'Уникальный идентификатор устройства',
        },
      },
      required: ['fingerprint'],
    },
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: { response: 'Вы вышли из аккаунта!' },
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Вы не авторизованы!',
  })
  async logout(
    @Body() fingerprint: string,
    @Req() req: ExpressRequest,
  ): Promise<{ response: string }> {
    const refreshTokenId = req.cookies['refresh-tokenId'];
    await this.authService.logout(req.body.fingerprint, refreshTokenId);
    return { response: 'Вы вышли из аккаунта!' };
  }

  @Post('login/tg')
  @ApiOperation({
    summary:
      'Запрос для телеграм бота, с помощью которого происходит аутентификация',
  })
  @ApiBody({
    description: 'ДТО данных для аутентификации',
    type: AuthTG,
    required: true,
  })
  async loginTG(@Body() authTg: AuthTG): Promise<void> {
    // Запрашиваем у клиента необходимую информацию
    const requiredInfo = ['fingerprint', 'userAgent', 'ip', 'token'];
    const clientInfo = await this.eventsGateway.requestInfoFromClient(
      authTg.clientId,
      requiredInfo,
    );

    if (clientInfo.token === authTg.token) {
      console.log(authTg.user.telegramId);
      if (authTg.user.telegramId === null) {
        const updateTgAuthUserDto: UpdateUserDto = {
          id: authTg.user.id,
          telegramId: authTg.telegramId,
        };
        await this.userService.update(authTg.user.id, updateTgAuthUserDto);
      }
      const authenticateResult = await this.authService.authenticateTG(
        authTg.user.id,
        clientInfo.ip,
        clientInfo.userAgent,
        clientInfo.fingerprint,
      );
      this.eventsGateway.sendTokenToClient(
        authTg.clientId,
        authenticateResult._user.id,
        authenticateResult._user.token,
        authenticateResult.refreshTokenId,
      );
    } else {
      this.eventsGateway.sendTokenToClient(
        authTg.clientId,
        'false',
        null,
        null,
      );
      throw new UnauthorizedException('Неуспешный вход!');
    }
  }

  @UseGuards(AccessTokenGuard)
  @ApiOperation({ summary: 'Установка куки' })
  @ApiBearerAuth('access-token')
  @ApiBody({
    description: 'Данные для выхода',
    type: String,
    schema: {
      type: 'object',
      properties: {
        fingerprint: {
          type: 'string',
          description: 'Уникальный идентификатор устройства',
        },
      },
      required: ['fingerprint'],
    },
    required: true,
  })
  @Post('set-cookie')
  setCookie(
    @Body('refreshTokenId') refreshTokenId: string,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    res.cookie('refresh-tokenId', refreshTokenId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'prod' ? true : false,
      path: '/',
      maxAge: Number(process.env.COOKIE_EXPIRESIN),
      sameSite: process.env.NODE_ENV === 'prod' ? 'strict' : 'lax',
    });
    return { message: 'Куки успешно установлены' };
  }
}
