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
export class ApproveConvertGuard implements CanActivate {
  constructor(private readonly convertService: ConvertService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as ReadUserDto;
    const convertId = request.params.convertId;
    if (!convertId) {
      throw new BadRequestException('Не передан ID конверта');
    }
    const convert = await this.convertService.findOneById(convertId, [
      'convertToPosts.post',
    ]);
    const userPostsIds = user.posts.map((post) => post.id);

    const isConvertActive = convert.convertStatus;
    const isUserPostActive = userPostsIds.includes(convert.activePostId);
    const isActiveLast =
      convert.activePostId === convert.pathOfPosts[convert.pathOfPosts.length]
        ? true
        : false;

    if (isUserPostActive && !isActiveLast && isConvertActive) {
      return true;
    }
    throw new ForbiddenException('Вы не можете одобрить данный конверт!');
  }
}
