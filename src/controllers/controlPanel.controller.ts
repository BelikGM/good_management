import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Inject,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Logger } from 'winston';
import { yellow } from 'colorette';
import { AccessTokenGuard } from 'src/guards/accessToken.guard';
import { OrganizationService } from 'src/application/services/organization/organization.service';
import { ControlPanelService } from 'src/application/services/controlPanel/controlPanel.service';
import { ControlPanelReadDto } from 'src/contracts/controlPanel/read-controlPanel.dto';
import { ControlPanelCreateDto } from 'src/contracts/controlPanel/create-controlPanel.dto';
import { ControlPanelUpdateDto } from 'src/contracts/controlPanel/update-controlPanel.dto';
import { PostService } from 'src/application/services/post/post.service';
import {
  findAllControlPanelsExample,
  findOneExample,
} from 'src/constants/swagger-examples/controlPanel/controlPanel-examples';
import { Request as ExpressRequest } from 'express';
import { ReadUserDto } from 'src/contracts/user/read-user.dto';
import { PermissionsGuard } from 'src/guards/permission.guard';
import { Actions, Modules } from 'src/domains/roleSetting.entity';
import { ActionAccess } from 'src/decorators/action-access.decorator';
import { ModuleAccess } from 'src/decorators/module-access.decorator';

@ApiTags('ControlPanels')
@ApiBearerAuth('access-token')
@UseGuards(AccessTokenGuard)
@Controller('controlPanels')
export class ControlPanelController {
  constructor(
    private readonly controlPanelService: ControlPanelService,
    private readonly organizationService: OrganizationService,
    private readonly postService: PostService,
    @Inject('winston') private readonly logger: Logger,
  ) { }

  @Get(':organizationId')
  @UseGuards(PermissionsGuard)
  @ModuleAccess(Modules.CONTROL_PANEL)
  @ActionAccess(Actions.READ)
  @ApiOperation({ summary: 'Все панели в организации' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'OK!',
    example: findAllControlPanelsExample,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Вы не авторизованы!',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiParam({
    name: 'organizationId',
    required: true,
    description: 'Id организации',
    example: '2d1cea4c-7cea-4811-8cd5-078da7f20167',
  })
  async findAll(
    @Req() req: ExpressRequest,
    @Param('organizationId') organizationId: string,
  ): Promise<ControlPanelReadDto[]> {
    const user = req.user as ReadUserDto;
    const userPostsIds = user.posts.map((post) => post.id);
    const controlPanels = await this.controlPanelService.findAllForOrganization(organizationId, userPostsIds);
    return controlPanels;
  }


  @Post('new')
  @UseGuards(PermissionsGuard)
  @ModuleAccess(Modules.CONTROL_PANEL)
  @ActionAccess(Actions.CREATE)
  @ApiOperation({ summary: 'Создать панель управления' })
  @ApiBody({
    description: 'ДТО для создания панели',
    type: ControlPanelCreateDto,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'CREATED!',
    example: { id: '71ba1ba2-9e53-4238-9bb2-14a475460689' },
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
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  async create(
    @Body() controlPanelCreateDto: ControlPanelCreateDto,
  ): Promise<{ id: string }> {
    const [organization, post] = await Promise.all([
      this.organizationService.findOneById(
        controlPanelCreateDto.organizationId,
      ),
      this.postService.findOneById(controlPanelCreateDto.postId),
    ]);
    controlPanelCreateDto.post = post;
    controlPanelCreateDto.organization = organization;
    const createdControlPanelId = await this.controlPanelService.create(
      controlPanelCreateDto,
    );
    this.logger.info(
      `${yellow('OK!')} - controlPanelCreateDto: ${JSON.stringify(controlPanelCreateDto)} - Создана новая панель!`,
    );
    return { id: createdControlPanelId };
  }

  @Patch(':controlPanelId/update')
  @UseGuards(PermissionsGuard)
  @ModuleAccess(Modules.CONTROL_PANEL)
  @ActionAccess(Actions.UPDATE)
  @ApiOperation({ summary: 'Обновить панель управления' })
  @ApiBody({
    description: 'ДТО для обновления панели',
    type: ControlPanelUpdateDto,
    required: true,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'ОК!',
    example: { id: '71ba1ba2-9e53-4238-9bb2-14a475460689' },
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
    description: 'Панель не найдена!',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiParam({
    name: 'controlPanelId',
    required: true,
    description: 'Id панели',
    example: 'a8b9c962-13d7-4b6f-a445-233b51fa6988',
  })
  async update(
    @Param('controlPanelId') controlPanelId: string,
    @Body() сontrolPanelUpdateDto: ControlPanelUpdateDto,
  ): Promise<{ id: string }> {
    const updatedControlPanelId = await this.controlPanelService.update(
      controlPanelId,
      сontrolPanelUpdateDto,
    );
    this.logger.info(
      `${yellow('OK!')} - UPDATED CONTROLPANEL: ${JSON.stringify(сontrolPanelUpdateDto)} - Панель успешно обновлена!`,
    );
    return { id: updatedControlPanelId };
  }

  @Delete(':controlPanelId/remove')
  @UseGuards(PermissionsGuard)
  @ModuleAccess(Modules.CONTROL_PANEL)
  @ActionAccess(Actions.DELETE)
  @ApiOperation({ summary: 'Удалить панель' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'ОК!',
    example: { message: 'Панель успешно удалена!' },
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Вы не авторизованы!',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Панель не найдена!',
  })
  @ApiResponse({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Ошибка сервера!',
  })
  @ApiParam({
    name: 'controlPanelId',
    required: true,
    description: 'Id панели',
  })
  async remove(
    @Param('controlPanelId') controlPanelId: string
  ) {
    await this.controlPanelService.remove(controlPanelId);
    return { message: 'Панель успешно удалена!' };
  }
}
