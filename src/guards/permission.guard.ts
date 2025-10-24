import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleSettingService } from 'src/application/services/roleSetting/roleSetting.service';
import { PostReadDto } from 'src/contracts/post/read-post.dto';
import { RoleSettingReadDto } from 'src/contracts/roleSetting/read-roleSetting.dto';
import { Roles } from 'src/domains/role.entity';
import { Actions, Modules } from 'src/domains/roleSetting.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
  private readonly logger = new Logger(PermissionsGuard.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly roleSettingService: RoleSettingService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 🧩 Получаем посты пользователя
    const posts: PostReadDto[] = request.user?.posts;
    if (!posts || posts.length === 0) {
      throw new ForbiddenException('У пользователя нет назначенных постов');
    }

    // 🧩 Определяем organizationId (из params | query | headers)
    const organizationId: string =
      request.params.organizationId ||
      request.query.organizationId ||
      request.headers['x-organization-id'];

    console.log("OrganizationId", organizationId);
    
    // 🧩 Определяем module и action из декораторов
    const module: Modules = this.reflector.get<Modules>(
      'module',
      context.getHandler(),
    );
    const action: Actions = this.reflector.get<Actions>(
      'action',
      context.getHandler(),
    );

   
    if (!module || !action) {
      throw new ForbiddenException('Модуль или действие не указаны');
    }

    // 🧩 Если организация не указана — разрешаем только чтение
    if (!organizationId) {
      return action === Actions.READ;
    }


    console.log('=== ALL USER POSTS ===');
    console.log(JSON.stringify(posts, null, 2));  

    // 🧩 Фильтруем посты по организации (с проверкой наличия organization)
    const orgPosts = posts.filter(
      (post) =>
        post.organization &&
        post.organization.id === organizationId &&
        !post.isArchive,
    );
    console.log('=== FILTERED ORG POSTS ===');
    console.log(JSON.stringify(orgPosts, null, 2));

    console.log(
      `${PermissionsGuard.name} -> canActivate -> organizationId:`,
      organizationId,
    );

    console.log(
      `${PermissionsGuard.name} -> canActivate -> post.organization.id list:`,
      posts.map((p) => p.organization?.id || null),
    );
    // 🧩 Если нет постов в этой организации — разрешаем только чтение
    if (orgPosts.length === 0) {
      this.logger.debug(
        `Нет постов пользователя в организации ${organizationId}`,
      );
      return action === Actions.READ;
    }

    // 🧩 Проверяем права по каждому посту
    for (const post of orgPosts) {
      if (!post.role) continue; // если роль не подгружена
      if (post.role.roleName === Roles.OWNER) {
        return true; // OWNER — полный доступ
      }

      const roleSetting = await this.roleSettingService.findByRoleAndModule(
        post.role.id,
        module,
      );

      if (this.checkPermission(roleSetting, module, action)) {
        return true;
      }
    }

    // ❌ Если ни один пост не дал права
    throw new ForbiddenException(
      'У вас нет прав для выполнения этого действия в данной организации',
    );
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
      case Actions.DELETE:
        return roleSettings.can_update; // или отдельный can_delete
      default:
        return false;
    }
  }
}
