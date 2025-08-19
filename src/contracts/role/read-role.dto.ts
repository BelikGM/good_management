import { Post } from 'src/domains/post.entity';
import { Roles } from 'src/domains/role.entity';
import { RoleSetting } from 'src/domains/roleSetting.entity';

export class RoleReadDto {
  id: string;
  roleName: Roles;
  createdAt: Date;
  updatedAt: Date;
  roleSettings: RoleSetting[];
  posts: Post[];
}
