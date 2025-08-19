import { Repository, DataSource } from 'typeorm';
import { Injectable } from '@nestjs/common';
import { RefreshSession } from '../../../../domains/refreshSession.entity';

@Injectable()
export class RefreshSessionRepository extends Repository<RefreshSession> {
  constructor(private dataSource: DataSource) {
    super(RefreshSession, dataSource.createEntityManager());
  }

  async findAllByUserId(userId: string): Promise<RefreshSession[] | null> {
    return await this.find({
      relations: ['user'],
      where: { user: { id: userId } },
    });
  }

  async findOneByFingerprint(
    fingerprint: string,
  ): Promise<RefreshSession | null> {
    const session = await this.findOne({
      relations: ['user'],
      where: { fingerprint: fingerprint },
    });
    return session;
  }

  async findOneByIdAndFingerprint(
    id: string,
    fingerprint: string,
  ): Promise<RefreshSession | null> {
    const session = await this.findOne({
      relations: ['user'],
      where: { fingerprint: fingerprint, id: id },
    });
    return session;
  }
}
