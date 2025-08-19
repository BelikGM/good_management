import {
  Body,
  Controller,
  HttpStatus,
  Inject,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { PanelToStatisticService } from 'src/application/services/panelToStatistic/panelToStatistic.service';
import { PanelToStatisticUpdateDto } from 'src/contracts/panelToStatistic/update-panelToStatistic.dto';
import { AccessTokenGuard } from 'src/guards/accessToken.guard';
import { Logger } from 'winston';

@UseGuards(AccessTokenGuard)
@ApiTags('PanelToStatistics')
@ApiBearerAuth('access-token')
@Controller('panelToStatistics')
export class PanelToStatisticController {
  constructor(
    private readonly panelToStatisticService: PanelToStatisticService,
    @Inject('winston') private readonly logger: Logger,
  ) {}

  @Patch('updateOrderNumbers')
  @ApiOperation({ summary: 'Обновить порядок статистик в панеле' })
  @ApiBody({
    description: 'ДТО для обновления порядка статистик в панеле',
    type: PanelToStatisticUpdateDto,
    isArray: true,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: 'Статистики успешно обновлены.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Ошибка валидации!',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Вы не авторизованы!',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Ресурс не найден!',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  async updateOrderNumbers(
    @Body() panelToStatisticUpdateDtos: PanelToStatisticUpdateDto[],
  ): Promise<{ message: string }> {
    const updatePanelToStatisticPromises = panelToStatisticUpdateDtos.map(
      async (panetlToStatisticUpdateDto) => {
        const updatedPanelToStatisticId =
          await this.panelToStatisticService.update(
            panetlToStatisticUpdateDto._id,
            panetlToStatisticUpdateDto,
          );
        return updatedPanelToStatisticId;
      },
    );
    await Promise.all(updatePanelToStatisticPromises);
    return { message: 'Статистики в панеле успешно обновлены.' };
  }
}
