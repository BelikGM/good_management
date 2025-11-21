import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from '../application/services/auth/auth.service';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtPayloadInterface } from '../utils/jwt-payload.interface';
import { ReadUserDto } from 'src/contracts/user/read-user.dto';

@Injectable()
export class AccessJwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_ACCESS_SECRET,
    });
  }

  async validate(payload: JwtPayloadInterface): Promise<ReadUserDto> {
    // payload.id — ты так шлёшь access токены
    const user = await this.authService.validateUser(payload);

    if (!user) {
      throw new UnauthorizedException('Пользователь не найден');
    }

    // ВОТ ЭТО ОЧЕНЬ ВАЖНО:
    // здесь уже есть:
    // user.posts
    //   .[i].organization
    //   .[i].role
    //   .[i].isArchive
    //   ...
    // Они попадут в req.user и будут доступны в Guard'ах.
    return user;
  }
}
