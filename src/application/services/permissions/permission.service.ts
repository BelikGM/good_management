// import { Injectable, InternalServerErrorException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository, In } from 'typeorm';
// import { Post } from 'src/domains/post.entity';
// import { RoleSetting } from 'src/domains/roleSetting.entity';
// import { UserPermissionsDto } from 'src/contracts/permissions/user-permissions.dto';
// import { ModulePermissionsDto } from 'src/contracts/permissions/module-permissions.dto';

// @Injectable()
// export class PermissionService {
//   constructor(
//     @InjectRepository(Post)
//     private readonly postRepo: Repository<Post>,
//     @InjectRepository(RoleSetting)
//     private readonly settingRepo: Repository<RoleSetting>,
//   ) {}

//   async getPermissionsForUser(userId: string): Promise<UserPermissionsDto> {
//     try {
//       const posts = await this.postRepo.find({
//         where: { user: { id: userId } },
//         relations: ['role'],
//       });

//       const roleIds = posts.map(post => post.role?.id).filter(Boolean);

//       if (roleIds.length === 0) {
//         return {
//           userId,
//           permissions: [],
//         };
//       }

//       const settings = await this.settingRepo.find({
//         where: { roleId: In(roleIds) },
//       });

//       const map = new Map<string, ModulePermissionsDto>();

//       for (const s of settings) {
//         const current = map.get(s.module) ?? {
//           module: s.module,
//           canRead: false,
//           canCreate: false,
//           canUpdate: false,
//         };

//         map.set(s.module, {
//           module: s.module,
//           canRead: current.canRead || s.can_read,
//           canCreate: current.canCreate || s.can_create,
//           canUpdate: current.canUpdate || s.can_update,
//         });
//       }

//       return {
//         userId,
//         permissions: Array.from(map.values()),
//       };
//     } catch (e) {
//       throw new InternalServerErrorException('Ошибка при получении прав пользователя');
//     }
//   }
// }
// src/application/services/permissions/permission.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Post } from 'src/domains/post.entity';
import { RoleSetting } from 'src/domains/roleSetting.entity';
import { UserPermissionsDto } from 'src/contracts/permissions/user-permissions.dto';
import { ModulePermissionsDto } from 'src/contracts/permissions/module-permissions.dto';

@Injectable()
export class PermissionService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,

    @InjectRepository(RoleSetting)
    private readonly settingRepo: Repository<RoleSetting>,
  ) {}

  async getPermissionsForUser(userId: string): Promise<UserPermissionsDto> {
    try {
      // 1. Получаем посты пользователя с ролью
      const posts = await this.postRepo.find({
        where: { user: { id: userId } },
        relations: ['role'], // Убедитесь что отношение 'role' существует в сущности Post
      });

      // 2. Извлекаем ID ролей
      const roleIds = posts
        .map((post) => post.role?.id)
        .filter((id): id is string => id !== undefined && id !== null);

      if (roleIds.length === 0) {
        return {
          userId,
          permissions: [],
        };
      }

      // 3. Получаем настройки для этих ролей
      const settings = await this.settingRepo.find({
        where: {
          role: {
            id: In(roleIds),
          },
        },
        relations: ['role'], // Добавляем relation для role
      });

      // 4. Агрегируем разрешения
      const permissionsMap = new Map<string, ModulePermissionsDto>();

      settings.forEach(setting => {
        const existing = permissionsMap.get(setting.module);
        
        permissionsMap.set(setting.module, {
          module: setting.module,
          canRead: existing ? existing.canRead || setting.can_read : setting.can_read,
          canCreate: existing ? existing.canCreate || setting.can_create : setting.can_create,
          canUpdate: existing ? existing.canUpdate || setting.can_update : setting.can_update,
        });
      });
      
      return {
        userId,
        permissions: Array.from(permissionsMap.values()),
      };
    } catch (error) {
      console.error('Error in getPermissionsForUser:', error);
      throw new InternalServerErrorException('Ошибка при получении прав пользователя');
    }
  }
}