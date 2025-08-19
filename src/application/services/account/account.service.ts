import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { AccountRepository } from './repository/account.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/domains/account.entity';
import { AccountReadDto } from 'src/contracts/account/read-account.dto';
import { AccountCreateDto } from 'src/contracts/account/create-account.dto';
import { Logger } from 'winston';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: AccountRepository,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async findAll(): Promise<AccountReadDto[]> {
    try {
      const accounts = await this.accountRepository.find();

      return accounts.map((account) => ({
        id: account.id,
        accountName: account.accountName,
        tenantId: account.tenantId,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
        users: account.users,
        organizations: account.organizations,
        goals: account.goals,
        objectives: account.objectives,
        policies: account.policies,
        projects: account.projects,
        strategies: account.strategies,
        posts: account.posts,
        statistics: account.statistics,
        roleSettings: account.roleSettings,
        policyDirectories: account.policyDirectories,
        converts: account.converts,
        groups: account.groups,
      }));
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при получении всех аккаунтов!',
      );
    }
  }

  async findOneById(id: string, relations?: string[]): Promise<AccountReadDto> {
    try {
      const account = await this.accountRepository.findOne({
        where: { id },
        relations: relations ?? [],
      });
      if (!account) throw new NotFoundException('Аккаунт не найден!');
      const accountReadDto: AccountReadDto = {
        id: account.id,
        accountName: account.accountName,
        tenantId: account.tenantId,
        createdAt: account.createdAt,
        updatedAt: account.updatedAt,
        users: account.users,
        organizations: account.organizations,
        goals: account.goals,
        objectives: account.objectives,
        policies: account.policies,
        projects: account.projects,
        strategies: account.strategies,
        posts: account.posts,
        statistics: account.statistics,
        roleSettings: account.roleSettings,
        policyDirectories: account.policyDirectories,
        converts: account.converts,
        groups: account.groups,
      };

      return accountReadDto;
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new InternalServerErrorException('Ошибка при получении аккаунта!');
    }
  }

  async remove(id: string): Promise<void> {
    await this.accountRepository.delete(id);
  }

  async create(accountCreateDto: AccountCreateDto): Promise<Account> {
    try {
      const account = new Account();
      account.id = accountCreateDto.id;
      account.accountName = accountCreateDto.accountName;
      account.tenantId = accountCreateDto.tenantId;
      return await this.accountRepository.save(account);
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException('Ошибка при создании аккаунта!');
    }
  }
}
