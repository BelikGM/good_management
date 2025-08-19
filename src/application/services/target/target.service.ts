import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { State, Target, Type } from 'src/domains/target.entity';
import { TargetRepository } from './repository/target.repository';
import { TargetReadDto } from 'src/contracts/target/read-target.dto';
import { TargetCreateDto } from 'src/contracts/target/create-target.dto';
import { TargetHolderService } from '../targetHolder/targetHolder.service';
import { TargetHolderCreateDto } from 'src/contracts/targetHolder/create-targetHolder.dto';
import { TargetUpdateDto } from 'src/contracts/target/update-target.dto';
import { Logger } from 'winston';
import { Between, In, IsNull, LessThan, Not, Or } from 'typeorm';
import { AttachmentToTargetService } from '../attachmentToTarget/attachmentToTarget.service';
import { PostService } from '../post/post.service';

@Injectable()
export class TargetService {
  constructor(
    @InjectRepository(Target)
    private readonly targetRepository: TargetRepository,
    private readonly targetHolderService: TargetHolderService,
    private readonly attachmentToTargetService: AttachmentToTargetService,
    private readonly postService: PostService,
    @Inject('winston') private readonly logger: Logger,
  ) { }

  async findAllPersonalForUserPosts(
    postIds: string[],
    isArchive: boolean,
    relations?: string[],
  ): Promise<TargetReadDto[]> {
    try {
      const today = new Date();
      const todayUTC = new Date(
        Date.UTC(
          today.getUTCFullYear(),
          today.getUTCMonth(),
          today.getUTCDate(),
        ),
      );
      const tomorrowUTC = new Date(
        Date.UTC(
          today.getUTCFullYear(),
          today.getUTCMonth(),
          today.getUTCDate() + 1,
        ),
      );
      const targets = await this.targetRepository.find({
        where: {
          holderPostId: In(postIds),
          project: { id: IsNull() },
          dateComplete: isArchive
            ? LessThan(todayUTC)
            : Or(IsNull(), Between(todayUTC, tomorrowUTC)),
          type: Type.PERSONAL,
        },
        relations: relations ?? [],
        order: { dateComplete: 'DESC' }
      });

      return targets.map((target) => ({
        id: target.id,
        type: target.type,
        orderNumber: target.orderNumber,
        content: target.content,
        holderPostId: target.holderPostId,
        targetState: target.targetState,
        dateStart: target.dateStart,
        deadline: target.deadline,
        dateComplete: target.dateComplete,
        createdAt: target.createdAt,
        updatedAt: target.updatedAt,
        targetHolders: target.targetHolders,
        project: target.project,
        policy: target.policy,
        attachmentToTargets: target.attachmentToTargets,
        convert: target.convert,
      }));
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при получении всех задач!',
      );
    }
  }

  async findAllOrdersForUserPosts(
    postIds: string[],
    isArchive: boolean,
    relations?: string[],
  ): Promise<TargetReadDto[]> {
    try {
      const today = new Date();
      const todayUTC = new Date(
        Date.UTC(
          today.getUTCFullYear(),
          today.getUTCMonth(),
          today.getUTCDate(),
        ),
      );
      const tomorrowUTC = new Date(
        Date.UTC(
          today.getUTCFullYear(),
          today.getUTCMonth(),
          today.getUTCDate() + 1,
        ),
      );
      const targets = await this.targetRepository.find({
        where: {
          holderPostId: In(postIds),
          project: { id: IsNull() },
          dateComplete: isArchive
            ? LessThan(todayUTC)
            : Or(IsNull(), Between(todayUTC, tomorrowUTC)),
          type: Type.ORDER,
        },
        relations: relations ?? [],
        order: { dateComplete: 'DESC' }
      });

      return targets.map((target) => ({
        id: target.id,
        type: target.type,
        orderNumber: target.orderNumber,
        content: target.content,
        holderPostId: target.holderPostId,
        targetState: target.targetState,
        dateStart: target.dateStart,
        deadline: target.deadline,
        dateComplete: target.dateComplete,
        createdAt: target.createdAt,
        updatedAt: target.updatedAt,
        targetHolders: target.targetHolders,
        project: target.project,
        policy: target.policy,
        attachmentToTargets: target.attachmentToTargets,
        convert: target.convert,
      }));
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при получении всех задач!',
      );
    }
  }

  async findAllFromProjectsForUserPosts(
    postIds: string[],
    isArchive: boolean,
  ): Promise<TargetReadDto[]> {
    try {
      const today = new Date();
      const todayUTC = new Date(
        Date.UTC(
          today.getUTCFullYear(),
          today.getUTCMonth(),
          today.getUTCDate(),
        ),
      );
      const tomorrowUTC = new Date(
        Date.UTC(
          today.getUTCFullYear(),
          today.getUTCMonth(),
          today.getUTCDate() + 1,
        ),
      );
      const targets = await this.targetRepository.find({
        where: {
          holderPostId: In(postIds),
          project: { id: Not(IsNull()) },
          dateComplete: isArchive
            ? LessThan(todayUTC)
            : Or(IsNull(), Between(todayUTC, tomorrowUTC)),
        },
        order: { dateComplete: 'DESC' }
      });

      return targets.map((target) => ({
        id: target.id,
        type: target.type,
        orderNumber: target.orderNumber,
        content: target.content,
        holderPostId: target.holderPostId,
        targetState: target.targetState,
        dateStart: target.dateStart,
        deadline: target.deadline,
        dateComplete: target.dateComplete,
        createdAt: target.createdAt,
        updatedAt: target.updatedAt,
        targetHolders: target.targetHolders,
        project: target.project,
        policy: target.policy,
        attachmentToTargets: target.attachmentToTargets,
        convert: target.convert,
      }));
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при получении всех задач!',
      );
    }
  }

  async findSendedTargets(
    postIds: string[],
    isArchive: boolean,
    relations?: string[],
  ): Promise<TargetReadDto[]> {
    try {
      const today = new Date();
      const todayUTC = new Date(
        Date.UTC(
          today.getUTCFullYear(),
          today.getUTCMonth(),
          today.getUTCDate(),
        ),
      );
      const tomorrowUTC = new Date(
        Date.UTC(
          today.getUTCFullYear(),
          today.getUTCMonth(),
          today.getUTCDate() + 1,
        ),
      );
      const targets = await this.targetRepository.find({
        where: {
          dateComplete: isArchive
            ? LessThan(todayUTC)
            : Or(IsNull(), Between(todayUTC, tomorrowUTC)),
            convert: {
              host: {
                id: In(postIds)
              }
            }
        },
        relations: relations ?? [],
        order: { dateComplete: 'DESC' }
      });

      return targets.map((target) => ({
        id: target.id,
        type: target.type,
        orderNumber: target.orderNumber,
        content: target.content,
        holderPostId: target.holderPostId,
        targetState: target.targetState,
        dateStart: target.dateStart,
        deadline: target.deadline,
        dateComplete: target.dateComplete,
        createdAt: target.createdAt,
        updatedAt: target.updatedAt,
        targetHolders: target.targetHolders,
        project: target.project,
        policy: target.policy,
        attachmentToTargets: target.attachmentToTargets,
        convert: target.convert,
      }));
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при получении всех отправленных задач!',
      );
    }
  }

  async create(targetCreateDto: TargetCreateDto): Promise<Target> {
    try {
      const target = new Target();
      target.type = targetCreateDto.type;
      target.orderNumber = targetCreateDto.orderNumber;
      target.content = targetCreateDto.content;
      target.holderPostId = targetCreateDto.holderPostId;
      target.dateStart = targetCreateDto.dateStart;
      target.deadline = targetCreateDto.deadline;
      target.project = targetCreateDto.project;
      target.policy = targetCreateDto.policy;
      target.convert = targetCreateDto.convert;
      const createdTargetResult = await this.targetRepository.insert(target);
      const createdTarget = await this.targetRepository.findOne({
        where: { id: createdTargetResult.identifiers[0].id },
      });
      if (targetCreateDto.holderPostId) {
        const targetHolderCreateDto: TargetHolderCreateDto = {
          target: createdTarget,
          post: targetCreateDto.holderPost,
        };
        await this.targetHolderService.create(targetHolderCreateDto);
      }
      if (targetCreateDto.attachmentIds != null && targetCreateDto.attachmentIds.length > 0) {
        await this.attachmentToTargetService.createSeveral(
          createdTarget,
          targetCreateDto.attachmentIds,
        );
      }
      return createdTarget;
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException('Ошибка при создании задачи');
    }
  }

  async createBulk(targetCreateDtos: TargetCreateDto[]): Promise<void> {
    try {
      const holderPostIds = targetCreateDtos
        .map((dto) => dto.holderPostId)
        .filter((holderPostId) => holderPostId != null);
      const holderPosts = await this.postService.findBulk(holderPostIds);
      const holderPostMap = new Map(holderPosts.map((post) => [post.id, post]));
      targetCreateDtos.forEach((targetCreateDto) => {
        targetCreateDto.holderPost = targetCreateDto.holderPostId
          ? holderPostMap.get(targetCreateDto.holderPostId)
          : null;
        if (targetCreateDto.targetState === State.ACTIVE) {
          targetCreateDto.dateStart = new Date();
        }
        return targetCreateDto;
      });
      const createdTargetsResult =
        await this.targetRepository.insert(targetCreateDtos);
      const createdTargetsIds = createdTargetsResult.identifiers.map(
        (obj) => obj.id,
      );
      const createdTargets = await this.targetRepository.findBy({
        id: In(createdTargetsIds),
      });
      const targetHolderCreateDtos: TargetHolderCreateDto[] = [];
      createdTargets.forEach((target) => {
        if (target.holderPostId != null) {
          targetHolderCreateDtos.push({
            target: target,
            post: holderPostMap.get(target.holderPostId),
          });
        }
      });
      if (targetHolderCreateDtos.length > 0) {
        await this.targetHolderService.createBulk(targetHolderCreateDtos);
      }
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException('Ошибка при создании задачи');
    }
  }

  async update(updateTargetDto: TargetUpdateDto): Promise<string> {
    try {
      const target = await this.targetRepository.findOne({
        where: { id: updateTargetDto._id },
      });
      if (!target) {
        throw new NotFoundException(
          `Задача с ID ${updateTargetDto._id} не найдена`,
        );
      }
      if (updateTargetDto.content) target.content = updateTargetDto.content;
      if (updateTargetDto.orderNumber)
        target.orderNumber = updateTargetDto.orderNumber;
      if (updateTargetDto.holderPost) {
        const targetHolderCreateDto: TargetHolderCreateDto = {
          target: target,
          post: updateTargetDto.holderPost,
        };
        await this.targetHolderService.create(targetHolderCreateDto);
        target.holderPostId = updateTargetDto.holderPostId;
      }
      if (updateTargetDto.targetState)
        target.targetState = updateTargetDto.targetState;
      if (updateTargetDto.targetState === State.FINISHED)
        target.dateComplete = new Date();
      if (updateTargetDto.dateStart)
        target.dateStart = updateTargetDto.dateStart;
      if (updateTargetDto.deadline) target.deadline = updateTargetDto.deadline;
      if (updateTargetDto.policy != null) {
        target.policy = updateTargetDto.policy;
      } else if (updateTargetDto.policyId === null) {
        target.policy = null;
      }
      if (updateTargetDto.attachmentIds) {
        await this.attachmentToTargetService.remove(target);
        await this.attachmentToTargetService.createSeveral(
          target,
          updateTargetDto.attachmentIds,
        );
      } else if (updateTargetDto.attachmentIds === null) {
        await this.attachmentToTargetService.remove(target);
      }
      await this.targetRepository.update(target.id, {
        content: target.content,
        orderNumber: target.orderNumber,
        holderPostId: target.holderPostId,
        targetState: target.targetState,
        dateStart: target.dateStart,
        deadline: target.deadline,
        dateComplete: target.dateComplete,
        policy: target.policy,
      });
      return target.id;
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException('Ошибка при обновлении задачи');
    }
  }

  async updateBulk(updateTargetDtos: TargetUpdateDto[]): Promise<void> {
    try {
      const targetIds = updateTargetDtos.map((target) => target._id);
      const targets = await this.targetRepository.findBy({ id: In(targetIds) });
      const foundIds = targets.map((target) => target.id);
      const missingIds = targetIds.filter((id) => !foundIds.includes(id));
      if (missingIds.length > 0) {
        throw new NotFoundException(
          `Не найдены задачи с IDs: ${missingIds.join(', ')}`,
        );
      }
      const holderPostForUpdationIds = updateTargetDtos
        .map((dto) => dto.holderPostId)
        .filter((holderPostId) => holderPostId != null);
      const holderPostsForUpdation = await this.postService.findBulk(
        holderPostForUpdationIds,
      );
      const holderPostMapForUpdation = new Map(
        holderPostsForUpdation.map((post) => [post.id, post]),
      );
      updateTargetDtos.forEach((updateTargetDto) => {
        updateTargetDto.holderPost = updateTargetDto.holderPostId
          ? holderPostMapForUpdation.get(updateTargetDto.holderPostId)
          : null;
        if (updateTargetDto.targetState === State.FINISHED)
          updateTargetDto.dateComplete = new Date();
        if (updateTargetDto.targetState === State.ACTIVE)
          updateTargetDto.dateStart = new Date();
      });
      const updatedTargetsResult = await this.targetRepository.upsert(
        updateTargetDtos.map((dto) => ({
          ...dto,
          id: dto._id,
        })),
        {
          conflictPaths: ['id'],
          skipUpdateIfNoValuesChanged: true,
          upsertType: 'on-conflict-do-update',
        },
      );
      const targetHolderCreateDtos: TargetHolderCreateDto[] = [];
      updateTargetDtos.forEach((targetUpdateDto) => {
        if (targetUpdateDto.holderPostId != null) {
          targetHolderCreateDtos.push({
            target: targets.find((target) => target.id === targetUpdateDto._id),
            post: holderPostMapForUpdation.get(targetUpdateDto.holderPostId),
          });
        }
      });
      if (targetHolderCreateDtos.length > 0) {
        await this.targetHolderService.createBulk(targetHolderCreateDtos);
      }
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException('Ошибка при обновлении задачи');
    }
  }

  async remove(_id: string): Promise<void> {
    try {
      const target = await this.targetRepository.findOne({
        where: { id: _id },
      });
      if (!target) {
        throw new NotFoundException(`Личная задача с ID ${_id} не найдена`);
      }
      if (target.type !== Type.PERSONAL) {
        throw new BadRequestException('Удалять можно только личные задачи!');
      }

      await this.targetRepository.remove(target);
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }
      if (err instanceof BadRequestException) {
        throw err;
      }
      throw new InternalServerErrorException(
        'Ошибка при удалении панели управления',
      );
    }
  }
}
