import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RoleSetting } from './roleSetting.entity';
import { Post } from './post.entity';

export enum Roles {
  OWNER = 'Собственник',
  ADMIN = 'Админ',
  HELPER = 'Помощник',
  DIRECTOR = 'Директор',
  MANAGER = 'Руководитель',
  EMPLOYEE = 'Сотрудник',
}

@Entity()
export class Role {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: Roles,
    nullable: false,
  })
  roleName: Roles;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @OneToMany(() => RoleSetting, (roleSetting) => roleSetting.role)
  roleSettings: RoleSetting[];

  @OneToMany(() => Post, (post) => post.role)
  posts: Post[];
}
