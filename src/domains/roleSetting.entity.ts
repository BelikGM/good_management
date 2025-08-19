import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { Account } from './account.entity';

export enum Modules {
  POLICY = 'policy',
  GOLE = 'goal',
  OBJECTIVE = 'objective',
  STRATEGY = 'strategy',
  PROJECT = 'project',
  POST = 'post',
  STATISTIC = 'statistic',
  WORKING_PLAN = 'working_plan',
  CONVERT = 'convert',
  CONTROL_PANEL = 'control_panel'
}

export enum Actions {
  READ = 'read',
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete'
}

@Entity()
export class RoleSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: Modules,
    nullable: false,
  })
  module: Modules;

  @Column({ type: 'boolean', default: true })
  can_read: boolean;

  @Column({ type: 'boolean', default: false })
  can_create: boolean;

  @Column({ type: 'boolean', default: false })
  can_update: boolean;

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @ManyToOne(() => Role, (role) => role.roleSettings)
  role: Role;

  @ManyToOne(() => Account, (account) => account.roleSettings, {
    nullable: false,
  })
  account: Account;
}
