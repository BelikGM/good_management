import {
  ForbiddenException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Logger } from 'winston';
import { ControlPanel, PanelType } from 'src/domains/controlPanel.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { And, Brackets, Or } from 'typeorm';
import { ControlPanelRepository } from './repository/controlPanel.repository';
import { PanelToStatisticService } from '../panelToStatistic/panelToStatistic.service';
import { ControlPanelReadDto } from 'src/contracts/controlPanel/read-controlPanel.dto';
import { ControlPanelCreateDto } from 'src/contracts/controlPanel/create-controlPanel.dto';
import { ControlPanelUpdateDto } from 'src/contracts/controlPanel/update-controlPanel.dto';
import { Transactional } from 'nestjs-transaction';

@Injectable()
export class ControlPanelService {
  constructor(
    @InjectRepository(ControlPanel)
    private readonly controlPanelRepository: ControlPanelRepository,
    private readonly panelToStatisticService: PanelToStatisticService,
    @Inject('winston') private readonly logger: Logger,
  ) { }

  async findAllForOrganization(
    organizationId: string,
    userPostsIds: string[]
  ): Promise<ControlPanelReadDto[]> {
    try {
      const controlPanels = await this.controlPanelRepository.createQueryBuilder('panel')
        .where('panel.organizationId = :organizationId', { organizationId })
        .andWhere(new Brackets(qb => {
          qb.where('panel.panelType = :globalType', {
            globalType: PanelType.GLOBAL
          })
            .orWhere('panel.panelType = :personalType AND panel.postId IN (:...userPostsIds)', {
              personalType: PanelType.LOCAL,
              userPostsIds
            });
        }))
        .getMany();
      return controlPanels.map((controlPanel) => ({
        id: controlPanel.id,
        panelName: controlPanel.panelName,
        orderNumber: controlPanel.orderNumber,
        controlPanelNumber: controlPanel.controlPanelNumber,
        panelType: controlPanel.panelType,
        isNameChanged: controlPanel.isNameChanged,
        createdAt: controlPanel.createdAt,
        updatedAt: controlPanel.updatedAt,
        panelToStatistics: controlPanel.panelToStatistics,
        organization: controlPanel.organization,
        post: controlPanel.post,
      }));
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при получении всех политик!',
      );
    }
  }

  async findOneById(id: string): Promise<ControlPanelReadDto> {
    try {
      const controlPanel = await this.controlPanelRepository.findOne({
        where: { id },
        relations: ['panelToStatistics.statistic.statisticDatas'],
      });
      if (!controlPanel)
        throw new NotFoundException(`Панель управления с ID: ${id} не найдена`);
      const controlPanelReadDto: ControlPanelReadDto = {
        id: controlPanel.id,
        panelName: controlPanel.panelName,
        orderNumber: controlPanel.orderNumber,
        controlPanelNumber: controlPanel.controlPanelNumber,
        panelType: controlPanel.panelType,
        isNameChanged: controlPanel.isNameChanged,
        createdAt: controlPanel.createdAt,
        updatedAt: controlPanel.updatedAt,
        panelToStatistics: controlPanel.panelToStatistics,
        organization: controlPanel.organization,
        post: controlPanel.post,
      };

      return controlPanelReadDto;
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new InternalServerErrorException(
        'Ошибка при получении панели управленияв',
      );
    }
  }

  @Transactional()
  async create(controlPanelCreateDto: ControlPanelCreateDto): Promise<string> {
    try {
      const controlPanel = new ControlPanel();
      controlPanel.panelName = controlPanelCreateDto.panelName;
      controlPanel.orderNumber = controlPanelCreateDto.orderNumber;
      controlPanel.organization = controlPanelCreateDto.organization;
      controlPanel.post = controlPanelCreateDto.post;
      const createdControlPanel =
        await this.controlPanelRepository.save(controlPanel);
      if (controlPanelCreateDto.statisticIds) {
        await this.panelToStatisticService.createSeveral(
          createdControlPanel,
          controlPanelCreateDto.statisticIds,
        );
      }

      return createdControlPanel.id;
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при создании панели управления',
      );
    }
  }

  @Transactional()
  async update(
    _id: string,
    updateControlPanelDto: ControlPanelUpdateDto,
  ): Promise<string> {
    try {
      const controlPanel = await this.controlPanelRepository.findOne({
        where: { id: _id },
      });
      if (!controlPanel) {
        throw new NotFoundException(`Панель с ID ${_id} не найдена`);
      }
      if (updateControlPanelDto.panelName) {
        controlPanel.panelName = updateControlPanelDto.panelName;
        controlPanel.isNameChanged = true;
      }
      if (updateControlPanelDto.panelType)
        controlPanel.panelType = updateControlPanelDto.panelType;
      if (updateControlPanelDto.statisticIds) {
        await this.panelToStatisticService.remove(controlPanel);
        await this.panelToStatisticService.createSeveral(
          controlPanel,
          updateControlPanelDto.statisticIds,
        );
      }
      await this.controlPanelRepository.update(controlPanel.id, {
        panelName: controlPanel.panelName,
        panelType: controlPanel.panelType,
        isNameChanged: controlPanel.isNameChanged,
      });
      return controlPanel.id;
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new InternalServerErrorException('Ошибка при обновлении политики');
    }
  }

  async remove(_id: string): Promise<void> {
    try {
      const controlPanel = await this.controlPanelRepository.findOne({
        where: { id: _id },
      });
      if (!controlPanel) {
        throw new NotFoundException(`Панель с ID ${_id} не найдена`);
      }

      await this.controlPanelRepository.delete({ id: _id });
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new InternalServerErrorException(
        'Ошибка при удалении панели управления',
      );
    }
  }
}
