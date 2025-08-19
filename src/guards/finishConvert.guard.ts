import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConvertService } from 'src/application/services/convert/convert.service';
import { ReadUserDto } from 'src/contracts/user/read-user.dto';

@Injectable()
export class FinishConvertGuard implements CanActivate {
  constructor(private readonly convertService: ConvertService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as ReadUserDto;
    const convertId = request.params.convertId;
    if (!convertId) {
      throw new BadRequestException('Не передан ID конверта');
    }
    const convert = await this.convertService.findOneById(convertId, [
      'host.user',
    ]);

    if (convert.host.user === undefined) {
      throw new ForbiddenException('Вы не можете завершить данный конверт!');
    }

    if (user.id === convert.host.user.id) {
      return true;
    }

    throw new ForbiddenException('Вы не можете завершить данный конверт!');
  }
}
