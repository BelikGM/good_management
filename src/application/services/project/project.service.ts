import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Project, Type } from 'src/domains/project.entity';
import { ProjectRepository } from './repository/project.repository';
import { ProjectReadDto } from 'src/contracts/project/read-project.dto';
import { ProjectCreateDto } from 'src/contracts/project/create-project.dto';
import { Logger } from 'winston';
import { ProjectUpdateDto } from 'src/contracts/project/update-project.dto';
import { DataSource, In, IsNull } from 'typeorm';
import { State, Type as TypeTarget } from 'src/domains/target.entity';
import { TargetService } from '../target/target.service';
import { Transactional } from 'nestjs-transaction';
import { ConvertCreateDto } from 'src/contracts/convert/create-convert.dto';
import { ConvertService } from '../convert/convert.service';
import { ConvertUpdateDto } from 'src/contracts/convert/update-convert.dto';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: ProjectRepository,
    private readonly targetService: TargetService,
    private readonly convertService: ConvertService,
    @Inject('winston') private readonly logger: Logger,
    private dataSource: DataSource,
  ) {}

  async findAllForOrganization(
    organizationId: string,
    relations?: string[],
  ): Promise<ProjectReadDto[]> {
    try {
      const projects = await this.projectRepository.find({
        where: { organization: { id: organizationId } },
        relations: relations ?? [],
      });

      return projects.map((project) => ({
        id: project.id,
        projectNumber: project.projectNumber,
        projectName: project.projectName,
        programId: project.programId,
        content: project.content,
        type: project.type,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        organization: project.organization,
        targets: project.targets,
        strategy: project.strategy,
        account: project.account,
        postCreator: project.postCreator,
      }));
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при получении всех проектов!',
      );
    }
  }

  async findAllProgramsForOrganization(
    organizationId: string,
    relations?: string[],
  ): Promise<ProjectReadDto[]> {
    try {
      const programs = await this.projectRepository.find({
        where: { type: Type.PROGRAM, organization: { id: organizationId } },
        relations: relations ?? [],
      });

      return programs.map((program) => ({
        id: program.id,
        projectNumber: program.projectNumber,
        projectName: program.projectName,
        programId: program.programId,
        content: program.content,
        type: program.type,
        createdAt: program.createdAt,
        updatedAt: program.updatedAt,
        organization: program.organization,
        targets: program.targets.map((target) => ({
          ...target,
          isExpired: target.deadline
            ? new Date(target.deadline) < new Date() &&
              target.targetState !== State.FINISHED
            : false,
        })),
        strategy: program.strategy,
        account: program.account,
        postCreator: program.postCreator,
      }));
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при получении всех програм!',
      );
    }
  }

  async findAllProjectsWithoutProgramForOrganization(
    organizationId: string,
    relations?: string[],
  ): Promise<ProjectReadDto[]> {
    try {
      const projects = await this.projectRepository.find({
        where: {
          type: Type.PROJECT,
          programId: IsNull(),
          organization: { id: organizationId },
        },
        relations: relations ?? [],
      });

      return projects.map((project) => ({
        id: project.id,
        projectNumber: project.projectNumber,
        projectName: project.projectName,
        programId: project.programId,
        content: project.content,
        type: project.type,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        organization: project.organization,
        targets: project.targets.map((target) => ({
          ...target,
          isExpired: target.deadline
            ? new Date(target.deadline) < new Date() &&
              target.targetState !== State.FINISHED
            : false,
        })),
        strategy: project.strategy,
        account: project.account,
        postCreator: project.postCreator,
      }));
    } catch (err) {
      this.logger.error(err);
      throw new InternalServerErrorException(
        'Ошибка при получении всех проектов!',
      );
    }
  }

  async findOneById(id: string, relations?: string[]): Promise<ProjectReadDto> {
    try {
      const project = await this.projectRepository.findOne({
        where: { id: id },
        relations: relations ?? [],
      });

      if (!project) throw new NotFoundException(`Проект с ID: ${id} не найден`);

      let program: ProjectReadDto;
      if (project.programId !== null) {
        program = await this.projectRepository.findOne({
          where: { id: project.programId },
        });
      } else {
        program = null;
      }

      const projectReadDto: ProjectReadDto = {
        id: project.id,
        projectNumber: project.projectNumber,
        projectName: project.projectName,
        programId: project.programId,
        programNumber: program !== null ? program.projectNumber : null,
        content: project.content,
        type: project.type,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        organization: project.organization,
        targets:
          relations !== undefined
            ? project.targets.map((target) => ({
                ...target,
                isExpired: target.deadline
                  ? new Date(target.deadline) < new Date() &&
                    target.targetState !== State.FINISHED
                  : false,
              }))
            : project.targets,
        strategy: project.strategy,
        account: project.account,
        postCreator: project.postCreator,
      };
      return projectReadDto;
    } catch (err) {
      console.log(err);
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException('Ошибка при получении проекта');
    }
  }

  async findOneProgramById(id: string): Promise<ProjectReadDto> {
    try {
      const program = await this.projectRepository.findOne({
        where: { id: id },
        relations: ['targets.targetHolders.post', 'strategy', 'organization'],
      });
      if (!program) throw new NotFoundException(`Проект с ID: ${id} не найден`);
      const programReadDto: ProjectReadDto = {
        id: program.id,
        projectNumber: program.projectNumber,
        projectName: program.projectName,
        programId: program.programId,
        content: program.content,
        type: program.type,
        createdAt: program.createdAt,
        updatedAt: program.updatedAt,
        organization: program.organization,
        targets: program.targets.map((target) => ({
          ...target,
          isExpired: target.deadline
            ? new Date(target.deadline) < new Date() &&
              target.targetState !== State.FINISHED
            : false,
        })),
        strategy: program.strategy,
        account: program.account,
        postCreator: program.postCreator,
      };

      return programReadDto;
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException('Ошибка при получении проекта');
    }
  }

  async findAllNotRejectedProjectsByProgramIdForOrganization(
    programId: string,
    organizationId: string,
  ): Promise<ProjectReadDto[]> {
    try {
      const projects = await this.projectRepository
        .createQueryBuilder('project')
        .leftJoinAndSelect('project.targets', 'target')
        .leftJoinAndSelect('target.targetHolders', 'targetHolder')
        .leftJoinAndSelect('targetHolder.post', 'post')
        .where('project.programId = :programId', { programId })
        .andWhere('target.type = :targetType', {
          targetType: TypeTarget.PRODUCT,
        })
        .andWhere('target.targetState != :rejectedState', {
          rejectedState: State.REJECTED,
        })
        .andWhere('project.organization.id = :organizationId', {
          organizationId: organizationId,
        })
        .getMany();
      return projects.map((project) => ({
        id: project.id,
        projectNumber: project.projectNumber,
        projectName: project.projectName,
        programId: project.programId,
        content: project.content,
        type: project.type,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
        organization: project.organization,
        targets: project.targets.map((target) => ({
          ...target,
          isExpired: target.deadline
            ? new Date(target.deadline) < new Date() &&
              target.targetState !== State.FINISHED
            : false,
        })),
        strategy: project.strategy,
        account: project.account,
        postCreator: project.postCreator,
      }));
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }
      throw new InternalServerErrorException('Ошибка при получении проекта');
    }
  }

  @Transactional()
  async create(projectCreateDto: ProjectCreateDto): Promise<string> {
    try {
      if (!projectCreateDto.postCreator) {
        throw new BadRequestException(
          'Вы должны быть закреплены хотя бы за одним постом!',
        );
      }

      const project = new Project();
      project.projectName = projectCreateDto.projectName;
      project.content = projectCreateDto.content;
      project.type = projectCreateDto.type;
      project.organization = projectCreateDto.organization;
      project.postCreator = projectCreateDto.postCreator;
      project.account = projectCreateDto.account;
      project.strategy = projectCreateDto.strategy;
      const createdProject = await this.projectRepository.save(project);
      projectCreateDto.targetCreateDtos.forEach((targetCreateDto) => {
        targetCreateDto.project = createdProject;
      });
      await this.targetService.createBulk(projectCreateDto.targetCreateDtos);
      return createdProject.id;
    } catch (err) {
      this.logger.error(err);
      if (err instanceof BadRequestException) {
        throw err;
      }
      throw new InternalServerErrorException('Ошибка при создании проекта');
    }
  }

  @Transactional()
  async update(
    _id: string,
    updateProjectDto: ProjectUpdateDto,
    convertCreateDtos: ConvertCreateDto[],
    convertUpdateDtos: ConvertUpdateDto[],
  ): Promise<string> {
    try {
      const project = await this.projectRepository.findOne({
        where: { id: _id },
        relations: ['strategy'],
      });
      if (!project) {
        throw new NotFoundException(`Проект с ID ${_id} не найден`);
      }
      if (updateProjectDto.projectName)
        project.projectName = updateProjectDto.projectName;
      if (updateProjectDto.programId !== undefined)
        project.programId = updateProjectDto.programId;
      if (updateProjectDto.content) project.content = updateProjectDto.content;

      if (updateProjectDto.strategyId != null) {
        project.strategy = updateProjectDto.strategy;
      } else if (updateProjectDto.strategyId === null) {
        project.strategy = null;
      }

      await this.projectRepository.update(project.id, {
        projectName: project.projectName,
        programId: project.programId,
        content: project.content,
        organization: project.organization,
        strategy: project.strategy,
      });

      if (project.type === Type.PROGRAM && updateProjectDto.projectIds) {
        const projectsWithCurrentProgram = await this.projectRepository
          .createQueryBuilder('project')
          .leftJoinAndSelect('project.targets', 'targets')
          .where('project.programId = :programId', { programId: project.id })
          .andWhere((qb) => {
            const subQuery = qb
              .subQuery()
              .select('1')
              .from('target', 'subTargets')
              .where('subTargets.projectId = project.id')
              .andWhere('subTargets.type = :type', { type: TypeTarget.PRODUCT })
              .andWhere('subTargets.targetState = :state', {
                state: State.ACTIVE,
              })
              .getQuery();
            return `EXISTS (${subQuery})`;
          })
          .getMany();
        console.log(projectsWithCurrentProgram);
        let activeProjectsWithCurrentProgramIds = projectsWithCurrentProgram
          .filter((project) =>
            project.targets.some(
              (target) =>
                new Date(target.deadline) > new Date() &&
                target.targetState === State.ACTIVE &&
                target.type === TypeTarget.PRODUCT,
            ),
          )
          .map((project) => project.id);
        console.log(
          `activeProjectsWithCurrentProgramIds: ${activeProjectsWithCurrentProgramIds}`,
        );
        let expiredProjectsWithCurrentProgramIds = projectsWithCurrentProgram
          .filter((project) =>
            project.targets.some(
              (target) =>
                new Date(target.deadline) < new Date() &&
                target.targetState === State.ACTIVE &&
                target.type === TypeTarget.PRODUCT,
            ),
          )
          .map((project) => project.id);
        console.log(
          `expiredProjectsWithCurrentProgramIds: ${expiredProjectsWithCurrentProgramIds}`,
        );
        if (activeProjectsWithCurrentProgramIds === undefined)
          activeProjectsWithCurrentProgramIds = [];
        if (expiredProjectsWithCurrentProgramIds === undefined)
          expiredProjectsWithCurrentProgramIds = [];

        const projectIdsToAdd = updateProjectDto.projectIds.filter(
          (id) =>
            !activeProjectsWithCurrentProgramIds.includes(id) &&
            !expiredProjectsWithCurrentProgramIds.includes(id),
        );
        const projectIdsToUpdate = updateProjectDto.projectIds.filter((id) =>
          activeProjectsWithCurrentProgramIds.includes(id),
        );
        const commonArray = activeProjectsWithCurrentProgramIds.concat(
          expiredProjectsWithCurrentProgramIds,
        );
        const projectIdsToDelete = commonArray.filter(
          (id) => !updateProjectDto.projectIds.includes(id),
        );
        console.log(`projectIdsToAdd: ${projectIdsToAdd}`);
        console.log(`projectIdsToUpdate: ${projectIdsToUpdate}`);
        console.log(`projectIdsToDelete: ${projectIdsToDelete}`);
        if (projectIdsToAdd.length > 0) {
          await this.projectRepository.update(
            { id: In(projectIdsToAdd) },
            { programId: project.id, strategy: project.strategy },
          );
        }
        if (projectIdsToUpdate.length > 0) {
          await this.projectRepository.update(
            { id: In(projectIdsToUpdate) },
            { strategy: project.strategy },
          );
        }
        if (projectIdsToDelete.length > 0) {
          await this.projectRepository.update(
            { id: In(projectIdsToDelete) },
            { programId: null, strategy: null },
          );
        }
      }
      // const createdConverts = convertCreateDtos?.length
      //   ? await this.convertService.createBulkForProject(convertCreateDtos)
      //   : [];

      console.log(convertCreateDtos);
      console.log(convertUpdateDtos);
      if (updateProjectDto.targetCreateDtos.length > 0) {
        for (let i = 0; i < updateProjectDto.targetCreateDtos.length; i++) {
          const targetCreateDto = updateProjectDto.targetCreateDtos[i];
          if (
            convertCreateDtos.length > 0 &&
            convertCreateDtos[i].pathOfPosts.length > 1
          ) {
            const createdConvert = await this.convertService.create(
              convertCreateDtos[i],
            );
            targetCreateDto.convert = createdConvert;
          }
          targetCreateDto.project = project;
        }

        await this.targetService.createBulk(updateProjectDto.targetCreateDtos);
      }
      if (updateProjectDto.targetUpdateDtos.length > 0) {
        for (let i = 0; i < updateProjectDto.targetUpdateDtos.length; i++) {
          const targetUpdateDto = updateProjectDto.targetUpdateDtos[i];
          const convertCreateDtoForTarget = convertCreateDtos.find(
            (dto) => dto.targetId === targetUpdateDto._id,
          );
          if (targetUpdateDto.convert && convertUpdateDtos.length > 0) {
            const convertToUpdate = convertUpdateDtos.find(
              (dto) => dto.targetId === targetUpdateDto._id,
            );
            await this.convertService.updateFromProject(
              convertToUpdate._id,
              convertToUpdate,
            );
          } else if (
            convertCreateDtos.length > 0 &&
            convertCreateDtoForTarget.pathOfPosts.length > 1
          ) {
            const createdConvert = await this.convertService.create(
              convertCreateDtoForTarget,
            );
            targetUpdateDto.convert = createdConvert;
          }
        }
        await this.targetService.updateBulk(updateProjectDto.targetUpdateDtos);
      }

      return project.id;
    } catch (err) {
      this.logger.error(err);
      if (err instanceof NotFoundException) {
        throw err;
      }

      throw new InternalServerErrorException('Ошибка при обновлении проекта');
    }
  }
}
