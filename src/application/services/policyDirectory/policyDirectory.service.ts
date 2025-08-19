import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PolicyDirectory } from 'src/domains/policyDirectory.entity';
import { Logger } from 'winston';
import { PolicyDirectoryRepository } from './repository/policyDirectory.repository';
import { PolicyToPolicyDirectoryService } from '../policyToPolicyDirectories/policyToPolicyDirectory.service';
import { PolicyDirectoryReadDto } from 'src/contracts/policyDirectory/read-policyDirectory.dto';
import { PolicyDirectoryCreateDto } from 'src/contracts/policyDirectory/create-policyDirectory.dto';
import { PolicyDirectoryUpdateDto } from 'src/contracts/policyDirectory/update-policyDirectory.dto';
import { State } from 'src/domains/policy.entity';

@Injectable()
export class PolicyDirectoryService {
  constructor(
    @InjectRepository(PolicyDirectory)
    private readonly policyDirectoryRepository: PolicyDirectoryRepository,
    private readonly policyToPolicyDirectoryService: PolicyToPolicyDirectoryService,
    @Inject('winston') private readonly logger: Logger,
  ) { }

  async findAllForOrganization(
    organizationId: string,
  ): Promise<PolicyDirectoryReadDto[]> {
    try {
      const policyDirectories = await this.policyDirectoryRepository.createQueryBuilder("policyDirectory")
        .leftJoinAndSelect("policyDirectory.policyToPolicyDirectories", "policyToPolicyDirectory")
        .leftJoinAndSelect("policyToPolicyDirectory.policy", "policy")
        .where("policy.organizationId = :organizationId", { organizationId })
        .select([
          "policyDirectory.id",
          "policyDirectory.directoryName",
          "policyDirectory.createdAt",
          "policyDirectory.updatedAt",
          "policyToPolicyDirectory.id",
          "policyToPolicyDirectory.createdAt",
          "policyToPolicyDirectory.updatedAt",
          "policy.id",
          "policy.policyName",
          "policy.policyNumber",
          "policy.type",
          "policy.state",
          "policy.dateActive",
          "policy.createdAt",
          "policy.updatedAt",
          "policy.deadline",
        ])
        .getMany();
      return policyDirectories.map((policyDirectory) => ({
        id: policyDirectory.id,
        directoryName: policyDirectory.directoryName,
        createdAt: policyDirectory.createdAt,
        updatedAt: policyDirectory.updatedAt,
        policyToPolicyDirectories:
          policyDirectory.policyToPolicyDirectories.filter(
            (policyToPolicyDirectory) =>
              policyToPolicyDirectory.policy.state === State.ACTIVE,
          ),
      }));
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при получении всех папок с политиками!',
      );
    }
  }

  async findOneById(
    id: string,
  ): Promise<PolicyDirectoryReadDto> {
    try {
      const policyDirectory = await this.policyDirectoryRepository.createQueryBuilder("policyDirectory")
        .leftJoinAndSelect("policyDirectory.policyToPolicyDirectories", "policyToPolicyDirectory")
        .leftJoinAndSelect("policyToPolicyDirectory.policy", "policy")
        .where("policyDirectory.id = :id", { id })
        .select([
          "policyDirectory.id",
          "policyDirectory.directoryName",
          "policyDirectory.createdAt",
          "policyDirectory.updatedAt",
          "policyToPolicyDirectory.id",
          "policyToPolicyDirectory.createdAt",
          "policyToPolicyDirectory.updatedAt",
          "policy.id",
          "policy.policyName",
          "policy.policyNumber",
          "policy.type",
          "policy.state",
          "policy.dateActive",
          "policy.createdAt",
          "policy.updatedAt",
          "policy.deadline",
        ])
        .getOne();
      if (!policyDirectory)
        throw new NotFoundException(`Папка с ID: ${id} не найдена`);

      const policyDirectoryReadDto: PolicyDirectoryReadDto = {
        id: policyDirectory.id,
        directoryName: policyDirectory.directoryName,
        createdAt: policyDirectory.createdAt,
        updatedAt: policyDirectory.updatedAt,
        policyToPolicyDirectories:
          policyDirectory.policyToPolicyDirectories.filter(
            (policyToPolicyDirectory) =>
              policyToPolicyDirectory.policy.state === State.ACTIVE,
          ),
      };
      return policyDirectoryReadDto;
    } catch (err) {
      this.logger.error(err);

      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new InternalServerErrorException(
        'Ошибка при получении папки с политиками!',
      );
    }
  }

  async create(
    policyDirectoryCreateDto: PolicyDirectoryCreateDto,
  ): Promise<string> {
    try {
      const policyDirectory = new PolicyDirectory();
      policyDirectory.directoryName = policyDirectoryCreateDto.directoryName;
      policyDirectory.account = policyDirectoryCreateDto.account;
      const createdPolicyDirectory =
        await this.policyDirectoryRepository.save(policyDirectory);
      await this.policyToPolicyDirectoryService.createSeveral(
        createdPolicyDirectory,
        policyDirectoryCreateDto.policyToPolicyDirectories,
      );

      return createdPolicyDirectory.id;
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при создании папки с политиками',
      );
    }
  }

  async update(
    _id: string,
    updatePolicyDirectoryDto: PolicyDirectoryUpdateDto,
  ): Promise<string> {
    try {
      const policyDirectory = await this.policyDirectoryRepository.findOne({
        where: { id: _id },
      });
      if (!policyDirectory) {
        throw new NotFoundException(`Папка с ID ${_id} не найдена`);
      }
      if (updatePolicyDirectoryDto.directoryName)
        policyDirectory.directoryName = updatePolicyDirectoryDto.directoryName;

      if (updatePolicyDirectoryDto.policyToPolicyDirectories) {
        await this.policyToPolicyDirectoryService.remove(policyDirectory);
        await this.policyToPolicyDirectoryService.createSeveral(
          policyDirectory,
          updatePolicyDirectoryDto.policyToPolicyDirectories,
        );
      }
      await this.policyDirectoryRepository.update(policyDirectory.id, {
        directoryName: policyDirectory.directoryName,
      });
      return policyDirectory.id;
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException('Ошибка при обновлении папки');
    }
  }

  async remove(_id: string): Promise<void> {
    try {
      const policyDirectory = await this.policyDirectoryRepository.findOne({
        where: { id: _id },
      });
      if (!policyDirectory) {
        throw new NotFoundException(`Папка с ID ${_id} не найдена`);
      }

      await this.policyDirectoryRepository.delete({ id: _id });
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException('Ошибка при удалении папки');
    }
  }
}
