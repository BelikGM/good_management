import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConvertService } from 'src/application/services/convert/convert.service';
import { ReadUserDto } from 'src/contracts/user/read-user.dto';

@Injectable()
export class GetConvertGuard implements CanActivate {
  constructor(private readonly convertService: ConvertService) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as ReadUserDto;
    const convertId = request.params.convertId;
    if (!convertId) {
      throw new BadRequestException('Не передан ID конверта');
    }
    const convert = await this.convertService.findOneById(convertId, [
      'convertToPosts.post.user',
      'watchersToConvert.post',
    ]);

    // Получаем ID пользователей в конверте
    const userIdsInConvert = convert.convertToPosts.map(
      (convertToPost) => convertToPost.post.user?.id,
    );
    const userPostsIds = user.posts.map((post) => post.id);

    const watcherIdsInConvert = convert.watchersToConvert?.map(
      (watcherToConvert) => watcherToConvert.post.id,
    );
    // Проверяем, является ли пользователь владельцем или наблюдателем
    const isWatcher =
      watcherIdsInConvert?.some((id) => userPostsIds.includes(id)) ?? false;

    if (userIdsInConvert.includes(user.id) || isWatcher) {
      return true;
    }

    throw new ForbiddenException('У вас нет доступа к этому конверту!');
  }
}
