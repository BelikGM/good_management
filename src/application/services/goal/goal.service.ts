import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { GoalRepository } from './repository/goal.repository';
import { GoalReadDto } from 'src/contracts/goal/read-goal.dto';
import { GoalCreateDto } from 'src/contracts/goal/create-goal.dto';
import { Goal } from 'src/domains/goal.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { AccountReadDto } from 'src/contracts/account/read-account.dto';
import { GoalUpdateDto } from 'src/contracts/goal/update-goal.dto';
import { Logger } from 'winston';

@Injectable()
export class GoalService {
  constructor(
    @InjectRepository(Goal)
    private readonly goalRepository: GoalRepository,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async findAllForAccount(
    account: AccountReadDto,
    relations?: string[],
  ): Promise<GoalReadDto[]> {
    try {
      const goals = await this.goalRepository.find({
        where: { account: { id: account.id } },
        relations: relations ?? [],
      });
      return goals.map((goal) => ({
        id: goal.id,
        content: goal.content,
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt,
        postCreator: goal.postCreator,
        account: goal.account,
        organization: goal.organization,
      }));
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при получении всех целей!',
      );
    }
  }

  async findOneByOrganizationId(
    organizationId: string,
    relations?: string[],
  ): Promise<GoalReadDto | null> {
    try {
      const goal = await this.goalRepository.findOne({
        where: { organization: { id: organizationId } },
        relations: relations ?? [],
      });

      if (!goal) return null;
      const goalReadDto: GoalReadDto = {
        id: goal.id,
        content: goal.content,
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt,
        organization: goal.organization,
        postCreator: goal.postCreator,
      };
      return goalReadDto;
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException('Ошибка при получении цели');
    }
  }

  async create(goalCreateDto: GoalCreateDto): Promise<string> {
    try {
      if (!goalCreateDto.postCreator) {
        throw new BadRequestException(
          'Вы должны быть закреплены хотя бы за одним постом!',
        );
      }
      const goal = new Goal();
      goal.content = goalCreateDto.content;
      goal.postCreator = goalCreateDto.postCreator;
      goal.account = goalCreateDto.account;
      goal.organization = goalCreateDto.organization;
      const createdGoalId = await this.goalRepository.insert(goal);
      return createdGoalId.identifiers[0].id;
    } catch (err) {
      this.logger.error(err);
      if (err instanceof BadRequestException) {
        throw err;
      }
      throw new InternalServerErrorException('Ошибка при создании цели');
    }
  }

  async update(_id: string, updateGoalDto: GoalUpdateDto): Promise<string> {
    try {
      const goal = await this.goalRepository.findOne({ where: { id: _id } });

      if (!goal) {
        throw new NotFoundException(`Цель с ID ${_id} не найдена`);
      }

      if (updateGoalDto.content) goal.content = updateGoalDto.content;

      await this.goalRepository.update(goal.id, { content: goal.content });

      return goal.id;
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException('Ошибка при обновлении цели');
    }
  }
}
