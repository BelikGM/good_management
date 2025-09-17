import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Logger } from 'winston';
import { PanelToStatisticRepository } from './repository/panelToStatistic.repository';
import { ControlPanel } from 'src/domains/controlPanel.entity';
import { PanelToStatistic } from 'src/domains/panelToStatistic.entity';
import { StatisticService } from '../statistic/statistic.service';
import { ControlPanelReadDto } from 'src/contracts/controlPanel/read-controlPanel.dto';
import { PanelToStatisticUpdateDto } from 'src/contracts/panelToStatistic/update-panelToStatistic.dto';

@Injectable()
export class PanelToStatisticService {
  constructor(
    @InjectRepository(PanelToStatisticRepository)
    private readonly panelToStatisticRepository: PanelToStatisticRepository,
    private readonly statisticService: StatisticService,
    @Inject('winston') private readonly logger: Logger,
  ) { }

  async createSeveral(
    controlPanel: ControlPanel,
    statisticIds: string[],
  ): Promise<void> {
    try {
      const statistics = await this.statisticService.findBulk(statisticIds);

      const panelToStatistics = statistics.map((statistic) => {
        const panelToStatistic = new PanelToStatistic();
        panelToStatistic.controlPanel = controlPanel;
        panelToStatistic.statistic = statistic;
        return panelToStatistic;
      });
      await this.panelToStatisticRepository.insert(panelToStatistics);
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при связывании статистик с панелью!',
      );
    }
  }

  async update(
    _id: string,
    panelToStatisticUpdateDto: PanelToStatisticUpdateDto,
  ): Promise<string> {
    try {
      const panelToStatistic = await this.panelToStatisticRepository.findOne({
        where: { id: _id },
      });
      if (!panelToStatistic) {
        throw new NotFoundException(
          `Статистика с ID ${_id} в панеле не найдена`,
        );
      }
      if (panelToStatisticUpdateDto.orderStatisticNumber) {
        panelToStatistic.orderStatisticNumber = panelToStatisticUpdateDto.orderStatisticNumber;
      }
      await this.panelToStatisticRepository.update(panelToStatistic.id, {
        orderStatisticNumber: panelToStatistic.orderStatisticNumber,
      });
      return panelToStatistic.id;
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException(
        'Ошибка при обновлении статистики в панеле',
      );
    }
  }

  async remove(controlPanel: ControlPanelReadDto): Promise<void> {
    try {
      await this.panelToStatisticRepository.delete({
        controlPanel: controlPanel,
      });
    }
    catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при удалении связанных статистик с панелью!',
      );
    }
  }

  async syncPanelToStatistics(
    controlPanel: ControlPanel,
    statisticIds: string[],
    ): Promise<void> {
      try {
        const existing = await this.panelToStatisticRepository.find({
          where: { controlPanel: { id: controlPanel.id } },
          relations: ['statistic'],
        });

        const existingMap = new Map(
          existing.map((rel) => [rel.statistic.id, rel]),
        );
        const newIdSet = new Set(statisticIds);

        const toUpdate: PanelToStatistic[] = [];
        const toInsert: PanelToStatistic[] = [];
        const toDelete: PanelToStatistic[] = [];

        const statistics = await this.statisticService.findBulk(statisticIds);

        // Проходим по новому массиву и формируем порядок
        statisticIds.forEach((statId, index) => {
          const existingRel = existingMap.get(statId);
          if (existingRel) {
            // Обновляем порядок, если отличается
            if (existingRel.orderStatisticNumber !== index + 1) {
              existingRel.orderStatisticNumber = index + 1;
              toUpdate.push(existingRel);
            }
            existingMap.delete(statId); // удаляем, чтоб понять лишние потом
          } else {
            // Добавляем новое
            const stat = statistics.find((s) => s.id === statId);
            if (stat) {
              const newRel = new PanelToStatistic();
              newRel.controlPanel = controlPanel;
              newRel.statistic = stat;
              newRel.orderStatisticNumber = index + 1;
              toInsert.push(newRel);
            }
          }
        });

        // Всё, что осталось в existingMap — это лишние
        for (const rel of existingMap.values()) {
          toDelete.push(rel);
        }

        // Выполняем всё пакетно
        if (toUpdate.length > 0) {
          await this.panelToStatisticRepository.save(toUpdate);
        }
        if (toInsert.length > 0) {
          await this.panelToStatisticRepository.insert(toInsert);
        }
        if (toDelete.length > 0) {
          await this.panelToStatisticRepository.remove(toDelete);
        }
      } catch (err) {
        this.logger.error(err);
        throw new InternalServerErrorException(
          'Ошибка при обновлении связей panelToStatistic',
        );
      }
    }

}
