import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_REFRESH_SECRET,
      passReqToCallback: true, // позволяет получить req в validate
    });
  }

  validate(req: Request, payload: any) {
    // безопасно достаём заголовок авторизации
    const authHeader = req.get('Authorization');
    if (!authHeader) {
      throw new UnauthorizedException('Отсутствует заголовок Authorization');
    }

    // достаём сам токен
    const refreshToken = authHeader.split(' ')[1];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh токен не найден');
    }

    // возвращаем payload + сам токен
    return {
      ...payload,
      refreshToken,
    };
  }
}
