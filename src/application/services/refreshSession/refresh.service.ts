import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { RefreshSession } from 'src/domains/refreshSession.entity';
import { RefreshSessionRepository } from './Repository/refresh.repository';
import { ReadRefreshSessionDto } from 'src/contracts/refreshSession/read-refreshSession.dto';
import { CreateRefreshSessionDto } from 'src/contracts/refreshSession/create-refreshSession.dto';
import { Logger } from 'winston';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class RefreshService {
  constructor(
    private sessionsRepository: RefreshSessionRepository,
    @Inject(CACHE_MANAGER)
    private readonly cacheService: Cache,
    @Inject('winston')
    private readonly logger: Logger,
  ) {}

  async findAllByUserId(userId: string): Promise<ReadRefreshSessionDto[]> {
    try {
      const sessions = await this.sessionsRepository.findAllByUserId(userId);
      return sessions.map((session) => ({
        id: session.id,
        user_agent: session.user_agent,
        fingerprint: session.fingerprint,
        ip: session.ip,
        expiresIn: session.expiresIn,
        refreshToken: session.refreshToken,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        user: session.user,
      }));
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при получении всех сессий!',
      );
    }
  }

  async create(createSessionDto: CreateRefreshSessionDto): Promise<string> {
    try {
      const session = new RefreshSession();
      session.user_agent = createSessionDto.user_agent;
      session.fingerprint = createSessionDto.fingerprint;
      session.ip = createSessionDto.ip;
      session.expiresIn = createSessionDto.expiresIn;
      session.refreshToken = createSessionDto.refreshToken;
      session.user = createSessionDto.user;
      const refreshSession = await this.sessionsRepository.save(session);
      await this.cacheService.set<RefreshSession>(
        `session:${refreshSession.id}`,
        refreshSession,
        1860000,
      );
      return refreshSession.id;
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException('Ошибка при создании сессии!');
    }
  }

  async findOneByIdAndFingerprint(
    id: string,
    fingerprint: string,
  ): Promise<ReadRefreshSessionDto | null> {
    try {
      const session =
        (await this.cacheService.get<ReadRefreshSessionDto>(`session:${id}`)) ??
        (await this.sessionsRepository.findOneByIdAndFingerprint(
          id,
          fingerprint,
        ));
      if (!session) return null;

      const readRefreshSessionDto: ReadRefreshSessionDto = {
        id: session.id,
        user_agent: session.user_agent,
        fingerprint: session.fingerprint,
        ip: session.ip,
        expiresIn: session.expiresIn,
        refreshToken: session.refreshToken,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        user: session.user,
      };

      return readRefreshSessionDto;
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException('Ошибка при получении сессии');
    }
  }

  async remove(id: string): Promise<void> {
    await this.cacheService.del(`session:${id}`);
    await this.sessionsRepository.delete(id);
  }

  async updateRefreshTokenById(
    id: string,
    refreshToken: string,
  ): Promise<void> {
    try {
      const session = await this.sessionsRepository.findOneBy({ id });
      if (!session)
        throw new NotFoundException(`Сессия с ID: ${id} не найдена`);
      await this.sessionsRepository.update(id, {
        refreshToken: refreshToken,
      });
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException('Ошибка при обновлении сессии');
    }
  }
}
