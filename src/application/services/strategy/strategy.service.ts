import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { State, Strategy } from 'src/domains/strategy.entity';
import { StrategyRepository } from './repository/strategy.repository';
import { StrategyReadDto } from 'src/contracts/strategy/read-strategy.dto';
import { StrategyCreateDto } from 'src/contracts/strategy/create-strategy.dto';
import { AccountReadDto } from 'src/contracts/account/read-account.dto';
import { StrategyUpdateDto } from 'src/contracts/strategy/update-strategy.dto';
import { Logger } from 'winston';
import { In, IsNull, Not } from 'typeorm';

@Injectable()
export class StrategyService {
  constructor(
    @InjectRepository(Strategy)
    private readonly strategyRepository: StrategyRepository,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async findAllForOrganization(
    organizationId: string,
  ): Promise<StrategyReadDto[]> {
    try {
      const strategies = await this.strategyRepository.find({
        where: { organization: { id: organizationId } },
      });

      return strategies.map((strategy) => ({
        id: strategy.id,
        strategyNumber: strategy.strategyNumber,
        dateActive: strategy.dateActive,
        content: strategy.content,
        state: strategy.state,
        createdAt: strategy.createdAt,
        updatedAt: strategy.updatedAt,
        postCreator: strategy.postCreator,
        account: strategy.account,
        organization: strategy.organization,
        objective: strategy.objective,
        projects: strategy.projects,
      }));
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при получении всех стратегий!',
      );
    }
  }

  async findAllActiveOrDraftWithoutObjectiveForOrganization(
    organizationId: string,
  ): Promise<StrategyReadDto[]> {
    try {
      const strategies = await this.strategyRepository.find({
        where: {
          organization: { id: organizationId },
          state: In([State.ACTIVE, State.DRAFT]),
          objective: { id: IsNull() },
        },
        relations: ['objective'],
      });

      return strategies.map((strategy) => ({
        id: strategy.id,
        strategyNumber: strategy.strategyNumber,
        dateActive: strategy.dateActive,
        content: strategy.content,
        state: strategy.state,
        createdAt: strategy.createdAt,
        updatedAt: strategy.updatedAt,
        postCreator: strategy.postCreator,
        account: strategy.account,
        organization: strategy.organization,
        objective: strategy.objective,
        projects: strategy.projects,
      }));
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при получении всех стратегий!',
      );
    }
  }

  async findAllActiveForOrganization(
    organizationId: string,
    relations?: string[],
  ): Promise<StrategyReadDto[]> {
    try {
      const strategies = await this.strategyRepository.find({
        where: {
          organization: { id: organizationId },
          state: In([State.ACTIVE, State.DRAFT]),
        },
        relations: relations ?? [],
      });

      return strategies.map((strategy) => ({
        id: strategy.id,
        strategyNumber: strategy.strategyNumber,
        dateActive: strategy.dateActive,
        content: strategy.content,
        state: strategy.state,
        createdAt: strategy.createdAt,
        updatedAt: strategy.updatedAt,
        postCreator: strategy.postCreator,
        account: strategy.account,
        organization: strategy.organization,
        objective: strategy.objective,
        projects: strategy.projects,
      }));
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при получении всех стратегий!',
      );
    }
  }

  async findAllActiveWithObjectiveForAccount(
    account: AccountReadDto,
  ): Promise<StrategyReadDto[]> {
    try {
      const strategies = await this.strategyRepository.find({
        where: {
          account: { id: account.id },
          state: State.ACTIVE,
          objective: { id: Not(IsNull()) },
        },
        relations: ['objective'],
      });

      return strategies.map((strategy) => ({
        id: strategy.id,
        strategyNumber: strategy.strategyNumber,
        dateActive: strategy.dateActive,
        content: strategy.content,
        state: strategy.state,
        createdAt: strategy.createdAt,
        updatedAt: strategy.updatedAt,
        postCreator: strategy.postCreator,
        account: strategy.account,
        organization: strategy.organization,
        objective: strategy.objective,
        projects: strategy.projects,
      }));
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при получении всех стратегий!',
      );
    }
  }

  async findOneById(
    id: string,
    relations?: string[],
  ): Promise<StrategyReadDto> {
    try {
      const strategy = await this.strategyRepository.findOne({
        where: { id: id },
        relations: relations ?? [],
      });

      if (!strategy)
        throw new NotFoundException(`Стратегия с ID: ${id} не найдена`);
      const strategyReadDto: StrategyReadDto = {
        id: strategy.id,
        strategyNumber: strategy.strategyNumber,
        dateActive: strategy.dateActive,
        content: strategy.content,
        state: strategy.state,
        createdAt: strategy.createdAt,
        updatedAt: strategy.updatedAt,
        postCreator: strategy.postCreator,
        account: strategy.account,
        organization: strategy.organization,
        objective: strategy.objective,
        projects: strategy.projects,
      };

      return strategyReadDto;
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException('Ошибка при получении стратегии');
    }
  }

  async create(strategyCreateDto: StrategyCreateDto): Promise<string> {
    try {
      if (!strategyCreateDto.postCreator) {
        throw new BadRequestException(
          'Вы должны быть закреплены хотя бы за одним постом!',
        );
      }
      const strategy = new Strategy();
      strategy.content = strategyCreateDto.content;
      strategy.postCreator = strategyCreateDto.postCreator;
      strategy.account = strategyCreateDto.account;
      strategy.organization = strategyCreateDto.organization;
      const existingDraftStrategy = await this.strategyRepository.findOne({
        where: {
          state: State.DRAFT,
          organization: { id: strategy.organization.id },
        },
      });
      if (existingDraftStrategy) {
        throw new BadRequestException(
          'Может существовать только одна стратегия со статусом "Черновик".',
        );
      }
      const createdStrategyId = await this.strategyRepository.insert(strategy);

      return createdStrategyId.identifiers[0].id;
    } catch (err) {
      this.logger.error(err);
      if (err instanceof BadRequestException) {
        throw err;
      }
      throw new InternalServerErrorException('Ошибка при создании стратегии');
    }
  }

  async update(
    _id: string,
    updateStrategyDto: StrategyUpdateDto,
  ): Promise<string> {
    try {
      const strategy = await this.strategyRepository.findOne({
        where: { id: _id },
        relations: ['organization'],
      });
      if (!strategy) {
        throw new NotFoundException(`Стратегия с ID ${_id} не найдена`);
      }
      if (updateStrategyDto.content)
        strategy.content = updateStrategyDto.content;
      if (updateStrategyDto.state) {
        if (updateStrategyDto.state === State.DRAFT) {
          const existingDraftStrategy = await this.strategyRepository.findOne({
            where: {
              state: State.DRAFT,
              organization: { id: strategy.organization.id },
            },
          });
          if (existingDraftStrategy) {
            throw new BadRequestException(
              'Может существовать только одна стратегия со статусом "Черновик".',
            );
          }
        } else if (updateStrategyDto.state === State.ACTIVE) {
          const existingActiveStrategy = await this.strategyRepository.findOne({
            where: {
              state: State.ACTIVE,
              organization: { id: strategy.organization.id },
            },
          });
          if (existingActiveStrategy) {
            throw new BadRequestException(
              'Может существовать только одна стратегия со статусом "Активный".',
            );
          }
          strategy.dateActive = new Date();
        }
        strategy.state = updateStrategyDto.state;
      }

      await this.strategyRepository.update(strategy.id, {
        content: strategy.content,
        state: strategy.state,
      });
      return strategy.id;
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }
      if (err instanceof BadRequestException) {
        throw err;
      }
      throw new InternalServerErrorException(
        'Ой, что - то пошло не так при обновлении стратегии!',
      );
    }
  }
}
