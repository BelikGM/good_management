import { Repository, DataSource } from 'typeorm';
import { User } from '../../../../domains/user.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersRepository extends Repository<User> {
  constructor(private dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findByTelegramId(telegramId: number) {
    return await this.findOne({ where: { telegramId } });
  }

  async findByVkId(vk_id: number) {
    return await this.findOne({ where: { vk_id } });
  }
}
