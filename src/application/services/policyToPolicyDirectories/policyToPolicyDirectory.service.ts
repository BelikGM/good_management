import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from 'winston';
import { PolicyToPolicyDirectory } from 'src/domains/policyToPolicyDirectories.entity';
import { PolicyToPolicyDirectoryRepository } from './repository/policyToPolicyDirectory.repository';
import { PolicyDirectory } from 'src/domains/policyDirectory.entity';
import { PolicyService } from '../policy/policy.service';
import { PolicyDirectoryReadDto } from 'src/contracts/policyDirectory/read-policyDirectory.dto';

@Injectable()
export class PolicyToPolicyDirectoryService {
  constructor(
    @InjectRepository(PolicyToPolicyDirectory)
    private readonly policyToPolicyDirectoryRepository: PolicyToPolicyDirectoryRepository,
    private readonly policyService: PolicyService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async createSeveral(
    policyDirectory: PolicyDirectory,
    policyIds: string[],
  ): Promise<void> {
    try {
      const policies = await this.policyService.findBulk(policyIds);

      const policyToPolicyDirectories = policies.map((policy) => {
        const policyToPolicyDirectory = new PolicyToPolicyDirectory();
        policyToPolicyDirectory.policy = policy;
        policyToPolicyDirectory.policyDirectory = policyDirectory;
        return policyToPolicyDirectory;
      });
      await this.policyToPolicyDirectoryRepository.insert(
        policyToPolicyDirectories,
      );
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ой что-то пошло не так при добавлении политики в папку!',
      );
    }
  }

  async remove(policyDirectory: PolicyDirectoryReadDto): Promise<void> {
    try {
      await this.policyToPolicyDirectoryRepository.delete({
        policyDirectory: policyDirectory,
      });
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ой что-то пошло не так при удалении политик в папке!',
      );
    }
  }
}
