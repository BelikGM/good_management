import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Modules, RoleSetting } from 'src/domains/roleSetting.entity';
import { RoleSettingRepository } from './repository/roleSetting.repository';
import { RoleSettingReadDto } from 'src/contracts/roleSetting/read-roleSetting.dto';
import { Logger } from 'winston';
import { RoleSettingCreateDto } from 'src/contracts/roleSetting/create-roleSetting.dto';
import { RoleSettingUpdateDto } from 'src/contracts/roleSetting/update-roleSetting.dto';
import { Not } from 'typeorm';
import { Roles } from 'src/domains/role.entity';
import { AccountReadDto } from 'src/contracts/account/read-account.dto';
import { RoleReadDto } from 'src/contracts/role/read-role.dto';

@Injectable()
export class RoleSettingService {
  constructor(
    @InjectRepository(RoleSetting)
    private readonly roleSettingRepository: RoleSettingRepository,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  async findAll(): Promise<RoleSettingReadDto[]> {
    try {
      const roleSettings = await this.roleSettingRepository.find({
        where: {
          role: {
            roleName: Not(Roles.OWNER),
          },
        },
        relations: ['role'],
      });

      return roleSettings.map((roleSetting) => ({
        id: roleSetting.id,
        module: roleSetting.module,
        can_read: roleSetting.can_read,
        can_create: roleSetting.can_create,
        can_update: roleSetting.can_update,
        createdAt: roleSetting.createdAt,
        updatedAt: roleSetting.updatedAt,
        role: roleSetting.role,
        account: roleSetting.account,
      }));
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при получении настроек доступа',
      );
    }
  }

  async findByRoleAndModule(
    roleId: string,
    module: Modules,
  ): Promise<RoleSettingReadDto> {
    try {
      const roleSetting = await this.roleSettingRepository.findOne({
        where: { role: { id: roleId }, module: module },
        relations: ['role'],
      });

      if (!roleSetting)
        throw new NotFoundException(
          `Настройка с ID роли: ${roleId} и модуля ${module} не найдены`,
        );
      const roleSettingsReadDto: RoleSettingReadDto = {
        id: roleSetting.id,
        module: roleSetting.module,
        can_read: roleSetting.can_read,
        can_create: roleSetting.can_create,
        can_update: roleSetting.can_update,
        createdAt: roleSetting.createdAt,
        updatedAt: roleSetting.updatedAt,
        role: roleSetting.role,
        account: roleSetting.account,
      };

      return roleSettingsReadDto;
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException(
        'Ошибка при получении настроек доступа',
      );
    }
  }

  async create(roleSettingCreateDto: RoleSettingCreateDto): Promise<string> {
    try {
      const roleSetting = new RoleSetting();
      roleSetting.module = roleSettingCreateDto.module;
      roleSetting.can_create = roleSettingCreateDto.can_create;
      roleSetting.can_read = roleSettingCreateDto.can_read;
      roleSetting.can_update = roleSettingCreateDto.can_update;
      roleSetting.role = roleSettingCreateDto.role;
      roleSetting.account = roleSettingCreateDto.account;
      const createdRoleSettingId =
        await this.roleSettingRepository.insert(roleSetting);
      return createdRoleSettingId.identifiers[0].id;
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при создании прав доступа',
      );
    }
  }

  async createAllForAccount(
    account: AccountReadDto,
    roles: RoleReadDto[],
  ): Promise<string[]> {
    try {
      const modules: Modules[] = [
        Modules.POLICY,
        Modules.GOLE,
        Modules.OBJECTIVE,
        Modules.STRATEGY,
        Modules.PROJECT,
        Modules.POST,
        Modules.STATISTIC,
      ];

      const roleSettings = [];

      // Для каждой роли создаем настройки для каждого модуля
      for (const role of roles) {
        for (const module of modules) {
          const roleSetting = new RoleSetting();
          roleSetting.module = module;
          roleSetting.can_read = true;
          roleSetting.account = account;
          roleSetting.role = role; // Привязываем роль к настройке

          roleSettings.push(roleSetting);
        }
      }

      const createdSettingResult =
        await this.roleSettingRepository.insert(roleSettings);
      const createdSettingIds: string[] = [];
      createdSettingResult.identifiers.forEach((identifier) => {
        createdSettingIds.push(identifier.id);
      });
      return createdSettingIds;
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при создании прав доступа',
      );
    }
  }

  async update(
    _id: string,
    updateRoleSetting: RoleSettingUpdateDto,
  ): Promise<RoleSettingReadDto> {
    try {
      const roleSetting = await this.roleSettingRepository.findOneBy({
        id: _id,
      });
      if (!roleSetting)
        throw new NotFoundException(`Не найдена настройка с таким ID: ${_id}`);

      if (updateRoleSetting.can_create !== undefined)
        roleSetting.can_create = updateRoleSetting.can_create;
      if (updateRoleSetting.can_read !== undefined)
        roleSetting.can_read = updateRoleSetting.can_read;
      if (updateRoleSetting.can_update !== undefined)
        roleSetting.can_update = updateRoleSetting.can_update;

      return await this.roleSettingRepository.save(roleSetting);
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException(
        'Ошибка при обновлении настройки доступа!',
      );
    }
  }
}
