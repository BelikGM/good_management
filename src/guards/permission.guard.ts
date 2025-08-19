import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleSettingService } from 'src/application/services/roleSetting/roleSetting.service';
import { PostReadDto } from 'src/contracts/post/read-post.dto';
import { RoleSettingReadDto } from 'src/contracts/roleSetting/read-roleSetting.dto';
import { Roles } from 'src/domains/role.entity';
import { Actions, Modules, RoleSetting } from 'src/domains/roleSetting.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly roleSettingService: RoleSettingService,
  ) { }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const posts: PostReadDto[] = request.user?.posts;
    if (!posts) {
      return false;
    }
    
    const defaultPost = posts.find(
      (post) => post.isDefault
    );

    if (defaultPost.role.roleName === Roles.OWNER) {
      return true;
    }
    // Получаем модуль и действие из метаданных
    const module: Modules = this.reflector.get<Modules>(
      'module',
      context.getHandler(),
    );
    const action: Actions = this.reflector.get<Actions>(
      'action',
      context.getHandler(),
    );

    if (!module || !action) {
      return false;
    }

    const roleSetting = await this.roleSettingService.findByRoleAndModule(
      defaultPost.role.id,
      module,
    );
    const hasPermission = this.checkPermission(roleSetting, module, action);

    if (!hasPermission) {
      throw new ForbiddenException(
        'У вас нет прав для выполнения этого действия',
      );
    }

    return true;
  }

  private checkPermission(
    roleSettings: RoleSettingReadDto,
    module: Modules,
    action: Actions,
  ): boolean {
    if (!roleSettings || roleSettings.module !== module) return false;

    switch (action) {
      case Actions.READ:
        return roleSettings.can_read;
      case Actions.CREATE:
        return roleSettings.can_create;
      case Actions.UPDATE:
        return roleSettings.can_update;
      default:
        return false;
    }
  }
}
