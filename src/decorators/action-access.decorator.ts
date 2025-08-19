import { SetMetadata } from '@nestjs/common';
import { Actions } from 'src/domains/roleSetting.entity';

export const ActionAccess = (action: Actions) => SetMetadata('action', action);
