import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { OrganizationRepository } from './repository/organization.repository';
import { OrganizationReadDto } from 'src/contracts/organization/read-organization.dto';
import { OrganizationCreateDto } from 'src/contracts/organization/create-organization.dto';
import { Organization } from 'src/domains/organization.entity';
import { AccountReadDto } from 'src/contracts/account/read-account.dto';
import { OrganizationUpdateDto } from 'src/contracts/organization/update-organization.dto';
import { Logger } from 'winston';

@Injectable()
export class OrganizationService {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async findAllForAccount(
    accountId: string,
    relations?: string[],
  ): Promise<OrganizationReadDto[]> {
    try {
      const organizations = await this.organizationRepository.find({
        where: { account: { id: accountId } },
        relations: relations ?? [],
      });
      return organizations.map((organization) => ({
        id: organization.id,
        organizationName: organization.organizationName,
        parentOrganizationId: organization.parentOrganizationId,
        reportDay: organization.reportDay,
        colorCodes: organization.colorCodes,
        organizationColor: organization.organizationColor,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
        users: organization.users,
        posts: organization.posts,
        goal: organization.goal,
        policies: organization.policies,
        projects: organization.projects,
        strategies: organization.strategies,
        controlPanels: organization.controlPanels,
        account: organization.account,
      }));
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при получении всех организаций!',
      );
    }
  }

  async findOneById(
    id: string,
    relations?: string[],
  ): Promise<OrganizationReadDto> {
    try {
      const organization = await this.organizationRepository.findOne({
        where: { id: id },
        relations: relations ?? [],
      });

      if (!organization)
        throw new NotFoundException(`Организация с ID: ${id} не найдена`);
      const organizationReadDto: OrganizationReadDto = {
        id: organization.id,
        organizationName: organization.organizationName,
        parentOrganizationId: organization.parentOrganizationId,
        reportDay: organization.reportDay,
        colorCodes: organization.colorCodes,
        organizationColor: organization.organizationColor,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
        users: organization.users,
        posts: organization.posts,
        goal: organization.goal,
        policies: organization.policies,
        projects: organization.projects,
        strategies: organization.strategies,
        controlPanels: organization.controlPanels,
        account: organization.account,
      };

      return organizationReadDto;
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException(
        'Ошибка при получении организации',
      );
    }
  }

  async create(organizationCreateDto: OrganizationCreateDto): Promise<string> {
    try {
      const organization = new Organization();

      if (organizationCreateDto.id) organization.id = organizationCreateDto.id;

      organization.organizationName = organizationCreateDto.organizationName;

      if (organizationCreateDto.parentOrganizationId)
        organization.parentOrganizationId =
          organizationCreateDto.parentOrganizationId;

      if (organizationCreateDto.reportDay)
        organization.reportDay = organizationCreateDto.reportDay;

      organization.organizationColor = organizationCreateDto.organizationColor;

      organization.account = organizationCreateDto.account;

      const createdOrganizationId =
        await this.organizationRepository.insert(organization);
      return createdOrganizationId.identifiers[0].id;
    } catch (err) {
      this.logger.error(err);

      throw new InternalServerErrorException('Ошибка при создании организации');
    }
  }

  async update(
    _id: string,
    updateOrganizationDto: OrganizationUpdateDto,
  ): Promise<string> {
    try {
      const organization = await this.organizationRepository.findOne({
        where: { id: _id },
      });
      if (!organization) {
        throw new NotFoundException(`Организация с ID ${_id} не найдена`);
      }
      if (updateOrganizationDto.organizationName)
        organization.organizationName = updateOrganizationDto.organizationName;
      if (updateOrganizationDto.parentOrganizationId)
        organization.parentOrganizationId =
          updateOrganizationDto.parentOrganizationId;
      if (updateOrganizationDto.reportDay !== undefined)
        organization.reportDay = updateOrganizationDto.reportDay;
      if (updateOrganizationDto.colorCodes)
        organization.colorCodes = updateOrganizationDto.colorCodes;
      if (updateOrganizationDto.organizationColor)
        organization.organizationColor =
          updateOrganizationDto.organizationColor;
      await this.organizationRepository.update(_id, {
        organizationName: organization.organizationName,
        parentOrganizationId: organization.parentOrganizationId,
        reportDay: organization.reportDay,
        colorCodes: organization.colorCodes,
        organizationColor: organization.organizationColor,
      });
      return organization.id;
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException(
        'Ошибка при обновлении организации',
      );
    }
  }
}
