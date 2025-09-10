import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth,   ApiParam, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AccessTokenGuard } from 'src/guards/accessToken.guard'; // Добавляем guard
import { PermissionService } from 'src/application/services/permissions/permission.service';
import { UserPermissionsDto } from 'src/contracts/permissions/user-permissions.dto';
import { ModulePermissionsDto} from 'src/contracts/permissions/module-permissions.dto';
import { Request as ExpressRequest } from 'express';
import { ReadUserDto } from 'src/contracts/user/read-user.dto';

@ApiTags('Permissions')
@ApiBearerAuth('access-token')
@UseGuards(AccessTokenGuard) // Добавляем guard для защиты роута
@Controller('me')
export class PermissionController {
  constructor(private readonly permService: PermissionService) {}

  @Get('permissions')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Получить права текущего пользователя' })
  @ApiResponse({ 
    status: 200, 
    description: 'Права пользователя получены успешно',
    type: UserPermissionsDto 
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Не авторизован' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Внутренняя ошибка сервера' 
  })
  async getMyPermissions(@Req() req: ExpressRequest): Promise<UserPermissionsDto> { 
    const user = req.user as ReadUserDto;
    return this.permService.getPermissionsForUser(user.id);
  }
}