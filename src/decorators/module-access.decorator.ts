import { SetMetadata } from '@nestjs/common';
import { Modules } from 'src/domains/roleSetting.entity';

export const ModuleAccess = (module: Modules) => SetMetadata('module', module);
