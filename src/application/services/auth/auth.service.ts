import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Inject,
  InternalServerErrorException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { HttpService } from '@nestjs/axios';
import { ReadUserDto } from 'src/contracts/user/read-user.dto';
import { JwtService } from '@nestjs/jwt';
import { UserVkAuthDto } from 'src/contracts/user/user-vkauth-dto';
import { JwtPayloadInterface } from 'src/utils/jwt-payload.interface';
import { User } from 'src/domains/user.entity';
import { CreateRefreshSessionDto } from 'src/contracts/refreshSession/create-refreshSession.dto';
import { RefreshService } from '../refreshSession/refresh.service';
import { UserTgAuthDto } from 'src/contracts/user/user-tgauth-dto';
import { Logger } from 'winston';
import { AuthVK } from 'src/contracts/auth-vk.dto';
import { yellow } from 'colorette';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
    private readonly refreshService: RefreshService,
    @Inject(CACHE_MANAGER)
    private readonly cacheService: Cache,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async validateUser(payload: JwtPayloadInterface): Promise<ReadUserDto> {
    let user = await this.cacheService.get<ReadUserDto>(`user:${payload.id}`);
    if (user === null) {
      user = await this.usersService.findOne(payload.id, ['account', 'posts.role']);
      await this.cacheService.set<ReadUserDto>(
        `user:${user.id}`,
        user,
        1860000,
      );
    }
    return user;
  }

  async authenticateVK(
    auth: ReadUserDto,
    ip: string,
    user_agent: string,
    fingerprint: string,
  ): Promise<{ _user: UserVkAuthDto; refreshTokenId: string }> {
    try {
      const user = await this.usersService.findOne(auth.id);
      if (!user) {
        throw new BadRequestException();
      }

      const newSession: CreateRefreshSessionDto = {
        user_agent: user_agent,
        fingerprint: fingerprint,
        ip: ip,
        expiresIn: Math.floor(Date.now() / 1000) + 60 * 24 * 60 * 60, // Время жизни сессии в секундах (например, 60 дней),
        refreshToken: await this.jwtService.signAsync(
          { id: user.id },
          {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: process.env.JWT_REFRESH_EXPIRESIN,
          },
        ),
        user: auth,
      };
      const _newSessionId = await this.refreshService.create(newSession);
      const _user: UserVkAuthDto = {
        id: user.id,
        vk_id: user.vk_id,
        firstName: user.firstName,
        lastName: user.lastName,
        telephoneNumber: user.telephoneNumber,
        avatar_url: user.avatar_url,
        token: await this.jwtService.signAsync(
          { id: user.id },
          {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: process.env.JWT_ACCESS_EXPIRESIN,
          },
        ),
      };

      return { _user: _user, refreshTokenId: _newSessionId };
    } catch (err) {
      this.logger.error(err);
      if (err instanceof BadRequestException) {
        throw err;
      }
      throw new InternalServerErrorException('Ошибка при входе через ВК!');
    }
  }

  async getVkToken(auth: AuthVK): Promise<any> {
    try {
      const VKDATA = {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
      };

      const host =
        process.env.NODE_ENV === 'prod'
          ? process.env.API_HOST
          : process.env.API_LOCAL;
      return this.httpService
        .post(
          `https://id.vk.com/oauth2/auth`,
          {
            grant_type: 'authorization_code',
            code_verifier: auth.code_verifier,
            redirect_uri: host,
            code: auth.code,
            client_id: VKDATA.client_id,
            client_secret: VKDATA.client_secret,
            device_id: auth.device_id,
            state: auth.state,
          },
        )
        .toPromise();
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException('Ошибка при получении токена ВК!');
    }
  }

  async getUserDataFromVk(access_token: string): Promise<any> {
    try {
      const VKDATA = {
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
      };
      return this.httpService
        .post(`https://id.vk.com/oauth2/user_info`, {
          client_id: VKDATA.client_id,
          access_token: access_token,
        })
        .toPromise();
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при получении данных о пользователе ВК!',
      );
    }
  }

  async updateTokens(
    fingerprint: string,
    refreshTokenId: string,
  ): Promise<{ newRefreshTokenId: string; newAccessToken: string }> {
    try {
      const session = await this.refreshService.findOneByIdAndFingerprint(
        String(refreshTokenId),
        String(fingerprint),
      );

      if (!session) {
        this.logger.info(
          `Попытка обновления токенов с fingerprint: ${fingerprint} и refreshTokenId: ${refreshTokenId}`,
        );
        await this.refreshService.remove(refreshTokenId);
        throw new UnauthorizedException(
          'Войдите в свой аккаунт для дальнейшей работы!',
        );
      }
      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = currentTime > session.expiresIn;
      if (isExpired) {
        await this.refreshService.remove(refreshTokenId);
        throw new UnauthorizedException(
          'Ваша сессия истекла, пожалуйста, войдите еще раз в свой аккаунт.',
        );
      }
      const newSession: CreateRefreshSessionDto = {
        user_agent: session.user_agent,
        fingerprint: session.fingerprint,
        ip: session.ip,
        expiresIn: session.expiresIn,
        refreshToken: await this.jwtService.signAsync(
          { id: session.user.id },
          {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: process.env.JWT_REFRESH_EXPIRESIN,
          },
        ),
        user: session.user,
      };

      await this.refreshService.remove(session.id);

      const newSessionId = await this.refreshService.create(newSession);

      const _newAccessToken = await this.jwtService.signAsync(
        { id: newSession.user.id },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: process.env.JWT_ACCESS_EXPIRESIN,
        },
      );
      this.logger.info(
        `${yellow('OK!')} - CREATED SESSION WITH ID: ${newSessionId} - Создана сессия!`,
      );
      return {
        newRefreshTokenId: newSessionId,
        newAccessToken: _newAccessToken,
      };
    } catch (err) {
      this.logger.error(err);
      if (err instanceof UnauthorizedException) {
        throw err;
      }

      throw new InternalServerErrorException(
        'Ой, что - то пошло не так при обновлении токенов!',
      );
    }
  }

  async logout(fingerprint: string, refreshTokenId: string): Promise<void> {
    try {
      const session = await this.refreshService.findOneByIdAndFingerprint(
        String(refreshTokenId),
        String(fingerprint),
      );
      if (!session) {
        await this.refreshService.remove(refreshTokenId);
        throw new UnauthorizedException(
          'Войдите в свой аккаунт для дальнейшей работы!',
        );
      }
      const currentTime = Math.floor(Date.now() / 1000);
      const isExpired = currentTime > session.expiresIn;
      if (isExpired) {
        throw new UnauthorizedException(
          'Пожалуйста, войдите еще раз в свой аккаунт.',
        );
      }
      await this.refreshService.remove(session.id);
    } catch (err) {
      this.logger.error(err);
      if (err instanceof UnauthorizedException) {
        throw err;
      }

      throw new InternalServerErrorException(
        'Ой, что - то пошло не так при обновлении токенов!',
      );
    }
  }

  async authenticateTG(
    userId: string,
    ip: string,
    user_agent: string,
    fingerprint: string,
  ): Promise<{ _user: UserTgAuthDto; refreshTokenId: string }> {
    try {
      const user = await this.usersService.findOne(userId);
      if (!user) {
        throw new BadRequestException();
      }

      const newSession: CreateRefreshSessionDto = {
        user_agent: user_agent,
        fingerprint: fingerprint,
        ip: ip,
        expiresIn: Math.floor(Date.now() / 1000) + 60 * 24 * 60 * 60, // Время жизни сессии в секундах (например, 60 дней),
        refreshToken: await this.jwtService.signAsync(
          { id: user.id },
          {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: process.env.JWT_REFRESH_EXPIRESIN,
          },
        ),
        user: user,
      };
      console.log(`${JSON.stringify(newSession)}`);
      const _newSessionId = await this.refreshService.create(newSession);
      const _user: UserTgAuthDto = {
        id: user.id,
        token: await this.jwtService.signAsync(
          { id: user.id },
          {
            secret: process.env.JWT_ACCESS_SECRET,
            expiresIn: process.env.JWT_ACCESS_EXPIRESIN,
          },
        ),
      };

      return { _user: _user, refreshTokenId: _newSessionId };
    } catch (err) {
      this.logger.error(err);
      if (err instanceof BadRequestException) {
        throw err;
      }
      throw new InternalServerErrorException('Ошибка при входе черет ТГ!');
    }
  }

  async isSessionExpired(
    fingerprint: string,
    refreshTokenId: string,
  ): Promise<{ isExpired: boolean; userId: string }> {
    const session = await this.refreshService.findOneByIdAndFingerprint(
      String(refreshTokenId),
      String(fingerprint),
    );
    if (session === null) {
      return { isExpired: true, userId: null };
    }
    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = currentTime > session.expiresIn;
    return { isExpired: isExpired, userId: session.user.id };
  }
}
