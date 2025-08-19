import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PolicyRepository } from './repository/policy.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Policy, State, Type } from 'src/domains/policy.entity';
import { PolicyReadDto } from 'src/contracts/policy/read-policy.dto';
import { PolicyCreateDto } from 'src/contracts/policy/create-policy.dto';
import { AccountReadDto } from 'src/contracts/account/read-account.dto';
import { PolicyUpdateDto } from 'src/contracts/policy/update-policy.dto';
import { Logger } from 'winston';
import { In } from 'typeorm';

@Injectable()
export class PolicyService {
  constructor(
    @InjectRepository(Policy)
    private readonly policyRepository: PolicyRepository,
    @Inject('winston') private readonly logger: Logger,
  ) { }

  async findAllForAccount(account: AccountReadDto): Promise<PolicyReadDto[]> {
    try {
      const policies = await this.policyRepository.find({
        where: { account: { id: account.id } },
      });

      return policies.map((policy) => ({
        id: policy.id,
        policyName: policy.policyName,
        policyNumber: policy.policyNumber,
        state: policy.state,
        type: policy.type,
        dateActive: policy.dateActive,
        content: policy.content,
        createdAt: policy.createdAt,
        updatedAt: policy.updatedAt,
        deadline: policy.deadline,
        posts: policy.posts,
        organization: policy.organization,
        postCreator: policy.postCreator,
        account: policy.account,
        policyToPolicyDirectories: policy.policyToPolicyDirectories,
        targets: policy.targets,
      }));
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при получении всех политик!',
      );
    }
  }

  async findAllForOrganization(
    organizationId: string,
    relations?: string[],
  ): Promise<PolicyReadDto[]> {
    try {
      const policies = await this.policyRepository.find({
        select: {
          id: true,
          policyName: true,
          policyNumber: true,
          type: true,
          state: true,
          dateActive: true,
          createdAt: true,
          updatedAt: true,
          deadline: true,
          posts: true,
          organization: true,
          postCreator: true,
          account: true,
          policyToPolicyDirectories: true,
          targets: true,
        },
        where: { organization: { id: organizationId } },
      });
      return policies.map((policy) => ({
        id: policy.id,
        policyName: policy.policyName,
        policyNumber: policy.policyNumber,
        state: policy.state,
        type: policy.type,
        dateActive: policy.dateActive,
        content: policy.content,
        createdAt: policy.createdAt,
        updatedAt: policy.updatedAt,
        deadline: policy.deadline,
        posts: policy.posts,
        organization: policy.organization,
        postCreator: policy.postCreator,
        account: policy.account,
        policyToPolicyDirectories: policy.policyToPolicyDirectories,
        targets: policy.targets,
      }));
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при получении всех политик!',
      );
    }
  }

  async findAllActiveForOrganization(
    organizationId: string,
  ): Promise<PolicyReadDto[]> {
    try {
      const policies = await this.policyRepository.find({
        select: {
          id: true,
          policyName: true,
          policyNumber: true,
          type: true,
          state: true,
          dateActive: true,
          createdAt: true,
          updatedAt: true,
          deadline: true,
          posts: true,
          organization: true,
          postCreator: true,
          account: true,
          policyToPolicyDirectories: true,
          targets: true,
        },
        where: {
          organization: { id: organizationId },
          state: State.ACTIVE,
        },
      });

      return policies.map((policy) => ({
        id: policy.id,
        policyName: policy.policyName,
        policyNumber: policy.policyNumber,
        state: policy.state,
        type: policy.type,
        dateActive: policy.dateActive,
        content: policy.content,
        createdAt: policy.createdAt,
        updatedAt: policy.updatedAt,
        deadline: policy.deadline,
        posts: policy.posts,
        organization: policy.organization,
        postCreator: policy.postCreator,
        account: policy.account,
        policyToPolicyDirectories: policy.policyToPolicyDirectories,
        targets: policy.targets,
      }));
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при получении всех политик!',
      );
    }
  }

  async findOneById(
    id: string,
    contentLoading: boolean,
    relations?: string[],
  ): Promise<PolicyReadDto | null> {
    try {
      const policy = await this.policyRepository.findOne({
        select: {
          id: true,
          policyName: true,
          policyNumber: true,
          type: true,
          state: true,
          content: contentLoading,
          dateActive: true,
          createdAt: true,
          updatedAt: true,
          deadline: true,
          posts: true,
          organization: true,
          postCreator: true,
          account: true,
          policyToPolicyDirectories: true,
          targets: true,
        },
        where: { id },
        relations: relations ?? [],
      });
      if (!policy)
        throw new NotFoundException(`Политика с ID: ${id} не найдена`);
      const policyReadDto: PolicyReadDto = {
        id: policy.id,
        policyName: policy.policyName,
        policyNumber: policy.policyNumber,
        state: policy.state,
        type: policy.type,
        dateActive: policy.dateActive,
        content: policy.content,
        createdAt: policy.createdAt,
        updatedAt: policy.updatedAt,
        deadline: policy.deadline,
        posts: policy.posts,
        organization: policy.organization,
        postCreator: policy.postCreator,
        account: policy.account,
        policyToPolicyDirectories: policy.policyToPolicyDirectories,
        targets: policy.targets,
      };

      return policyReadDto;
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new InternalServerErrorException('Ошибка при получении политики');
    }
  }

  async findBulk(ids: string[]): Promise<PolicyReadDto[]> {
    try {
      const policies = await this.policyRepository.find({
        select: {
          id: true,
          policyName: true,
          policyNumber: true,
          type: true,
          state: true,
          dateActive: true,
          createdAt: true,
          updatedAt: true,
          deadline: true,
          posts: true,
          organization: true,
          postCreator: true,
          account: true,
          policyToPolicyDirectories: true,
          targets: true,
        },
        where: { id: In(ids) },
      });
      const foundPolicyIds = policies.map((policy) => policy.id);
      const missingPolicyIds = ids.filter((id) => !foundPolicyIds.includes(id));
      if (missingPolicyIds.length > 0) {
        throw new NotFoundException(
          `Не найдены политики с IDs: ${missingPolicyIds.join(', ')}`,
        );
      }
      return policies.map((policy) => ({
        id: policy.id,
        policyName: policy.policyName,
        policyNumber: policy.policyNumber,
        state: policy.state,
        type: policy.type,
        dateActive: policy.dateActive,
        content: policy.content,
        createdAt: policy.createdAt,
        updatedAt: policy.updatedAt,
        deadline: policy.deadline,
        posts: policy.posts,
        organization: policy.organization,
        postCreator: policy.postCreator,
        account: policy.account,
        policyToPolicyDirectories: policy.policyToPolicyDirectories,
        targets: policy.targets,
      }));
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException('Ошибка при получении политик');
    }
  }

  async create(policyCreateDto: PolicyCreateDto): Promise<string> {
    try {
      if (!policyCreateDto.postCreator) {
        throw new BadRequestException(
          'Вы должны быть закреплены хотя бы за одним постом!',
        );
      }
      const policy = new Policy();
      policy.policyName = policyCreateDto.policyName;
      policy.content = policyCreateDto.content;
      policy.postCreator = policyCreateDto.postCreator;
      policy.account = policyCreateDto.account;
      policy.organization = policyCreateDto.organization;
      const createdPolicy = await this.policyRepository.insert(policy);

      return createdPolicy.identifiers[0].id;
    } catch (err) {
      this.logger.error(err);
      if (err instanceof BadRequestException) {
        throw err;
      }
      throw new InternalServerErrorException('Ошибка при создании политики');
    }
  }

  // async findDirectivesForAccount(account: AccountReadDto): Promise<PolicyReadDto[]> {
  //     try {
  //         // Поиск всех политик с типом DIRECTIVE
  //         const directives = await this.policyRepository.find({ where: { type: Type.DIRECTIVE, account: { id: account.id } } });

  //         return directives;
  //     }
  //     catch (err) {
  //         this.logger.error(err);
  //         throw new InternalServerErrorException('Ошибка при получении директив!')
  //     }
  // }

  // async findInstructionsForAccount(account: AccountReadDto): Promise<PolicyReadDto[]> {
  //     try {
  //         // Поиск всех политик с типом INSTRUCTION
  //         const instructions = await this.policyRepository.find({ where: { type: Type.INSTRUCTION, account: { id: account.id } } });
  //         return instructions
  //     }
  //     catch (err) {

  //         this.logger.error(err);
  //         throw new InternalServerErrorException('Ошибка при получении инструкций!')
  //     }
  // }

  async update(_id: string, updatePolicyDto: PolicyUpdateDto): Promise<string> {
    try {
      const policy = await this.policyRepository.findOne({
        where: { id: _id },
      });
      if (!policy) {
        throw new NotFoundException(`Политика с ID ${_id} не найдена`);
      }
      if (updatePolicyDto.policyName)
        policy.policyName = updatePolicyDto.policyName;
      if (updatePolicyDto.state) policy.state = updatePolicyDto.state;
      if (updatePolicyDto.type) policy.type = updatePolicyDto.type;
      if (updatePolicyDto.content) policy.content = updatePolicyDto.content;

      if (updatePolicyDto.state === State.ACTIVE)
        policy.dateActive = new Date();

      if (updatePolicyDto.type === Type.DISPOSAL)
        policy.deadline = updatePolicyDto.deadline;

      await this.policyRepository.update(policy.id, {
        policyName: policy.policyName,
        state: policy.state,
        type: policy.type,
        content: policy.content,
        dateActive: policy.dateActive,
        deadline: policy.deadline,
      });
      return policy.id;
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new InternalServerErrorException('Ошибка при обновлении политики');
    }
  }
}
