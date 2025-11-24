import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RoleSettingService } from 'src/application/services/roleSetting/roleSetting.service';
import { UsersService } from 'src/application/services/users/users.service';
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
    private readonly usersService: UsersService, // для подгрузки постов
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    this.logger.debug(`PermissionsGuard -> request.path: ${request.path}`);
    this.logger.debug(`PermissionsGuard -> request.method: ${request.method}`);

    // 1️⃣ Попытка взять posts из req.user
    let posts: PostReadDto[] = request.user?.posts;

    if ((!posts || posts.length === 0) && request.user?.id) {
      try {
        this.logger.debug(
          `PermissionsGuard -> posts not present, loading from UsersService for userId: ${request.user.id}`,
        );
        const userFromDb = await this.usersService.findOne(request.user.id, [
          'account',
          'organization',
          'posts',
          'posts.role',
          'posts.organization',
        ]);

        if (userFromDb) {
          request.user = { ...request.user, ...userFromDb };
          posts = userFromDb.posts || [];
          this.logger.debug(`PermissionsGuard -> loaded posts from DB: ${posts.length}`);
        }
      } catch (err) {
        this.logger.error(`PermissionsGuard -> error loading posts: ${err?.message || err}`);
      }
    }

    if (!posts || posts.length === 0) {
      throw new ForbiddenException('У пользователя нет назначенных постов');
    }

    // 2️⃣ Определяем organizationId
    let organizationId: string =
      request.params?.organizationId ||
      request.query?.organizationId ||
      request.headers['x-organization-id'] ||
      request.body?.organizationId;

    this.logger.debug(`PermissionsGuard -> organizationId: ${organizationId}`);

    // 3️⃣ Определяем module/action
    const module: Modules = this.reflector.get<Modules>('module', context.getHandler());
    const action: Actions = this.reflector.get<Actions>('action', context.getHandler());

    this.logger.debug(`PermissionsGuard -> module: ${module}, action: ${action}`);

    if (!module || !action) {
      throw new ForbiddenException('Модуль или действие не указаны');
    }

    // 4️⃣ Если нет organizationId — разрешаем только READ
    if (!organizationId) {
      this.logger.debug(`PermissionsGuard -> no organizationId, allowing READ only`);
      return action === Actions.READ;
    }

    // 5️⃣ Фильтруем посты по организации
    const orgPosts = posts.filter(
      (post) => post.organization?.id === organizationId && !post.isArchive,
    );

    this.logger.debug(`PermissionsGuard -> user has ${orgPosts.length} posts in org ${organizationId}`);

    // 6️⃣ Если нет постов — разрешаем только READ
    if (orgPosts.length === 0) {
      this.logger.debug(`PermissionsGuard -> no posts in org, allowing READ only`);
      return action === Actions.READ;
    }

    // 7️⃣ Проверка роли и прав
    for (const post of orgPosts) {
      if (!post.role) {
        this.logger.debug(`PermissionsGuard -> post ${post.id} has no role`);
        continue;
      }

      if (post.role.roleName === Roles.OWNER) {
        this.logger.debug(`PermissionsGuard -> post ${post.id} role is OWNER -> allow`);
        return true;
      }

      let roleSetting: RoleSettingReadDto = null;
      try {
        roleSetting = await this.roleSettingService.findByRoleAndModule(post.role.id, module);
      } catch (err) {
        this.logger.error(`PermissionsGuard -> error fetching roleSetting: ${err?.message || err}`);
        throw new InternalServerErrorException('Ошибка проверки прав');
      }

      if (this.checkPermission(roleSetting, module, action)) {
        this.logger.debug(`PermissionsGuard -> allowed by roleSetting for post ${post.id}`);
        return true;
      } else {
        this.logger.debug(`PermissionsGuard -> denied by roleSetting for post ${post.id}`);
      }
    }

    this.logger.debug(`PermissionsGuard -> no posts allowed action -> throwing ForbiddenException`);
    throw new ForbiddenException('У вас нет прав для выполнения этого действия');
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
        return roleSettings.can_update; // или can_delete
      default:
        return false;
    }
  }
}
