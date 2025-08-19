// import { Test, TestingModule } from '@nestjs/testing';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { WinstonModule } from 'nest-winston';
// import { ProjectService } from 'src/application/services/project/project.service';
// import { ProjectRepository } from 'src/application/services/project/repository/project.repository';
// import { winstonConfig } from 'src/utils/winston-logger';
// import { RepositoryFake } from '../FakeClasses/repositoryFake';
// import { Project, Type } from 'src/domains/project.entity';
// import {
//   Target,
//   Type as TypeTarget,
//   State as TargetState,
// } from 'src/domains/target.entity';
// import { faker } from '@faker-js/faker/.';
// import { TargetCreateDto } from 'src/contracts/target/create-target.dto';
// import { BadRequestException, NotFoundException } from '@nestjs/common';
// import { ProjectCreateDto } from 'src/contracts/project/create-project.dto';
// import { State, Strategy } from 'src/domains/strategy.entity';
// import { Organization, ReportDay } from 'src/domains/organization.entity';
// import { ProjectReadDto } from 'src/contracts/project/read-project.dto';
// import { Account } from 'src/domains/account.entity';
// import { IsNull } from 'typeorm';
// import { ProjectUpdateDto } from 'src/contracts/project/update-project.dto';

// describe('ProjectService', () => {
//   let projectService: ProjectService;
//   let projectRepository: ProjectRepository;
//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       imports: [WinstonModule.forRoot(winstonConfig)],
//       providers: [
//         ProjectService,
//         {
//           provide: getRepositoryToken(Project),
//           useClass: RepositoryFake,
//         },
//       ],
//     }).compile();
//     projectService = module.get(ProjectService);
//     projectRepository = module.get(getRepositoryToken(Project));
//   });

//   describe('finding all projects by organization', () => {
//     it('returns all projects by organization', async () => {
//       const organization: Organization = {
//         id: faker.string.uuid(),
//         organizationName: faker.company.name(),
//         parentOrganizationId: {} as any,
//         reportDay: ReportDay.FRIDAY,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         goal: {} as any,
//         users: {} as any,
//         posts: {} as any,
//         policies: {} as any,
//         projects: {} as any,
//         strategies: {} as any,
//         account: {} as any,
//       };

//       const baseTask = {
//         orderNumber: 1,
//         content: 'Контент задачи',
//         holderUserId: '3b809c42-2824-46c1-9686-dd666403402a',
//         dateStart: new Date('2024-09-18T14:59:47.010Z'),
//         deadline: new Date('2024-09-18T14:59:47.010Z'),
//         holderUser: {} as any,
//         project: {} as any,
//       };
//       const targets: Target[] = [
//         TypeTarget.PRODUCT,
//         TypeTarget.COMMON,
//         TypeTarget.RULE,
//         TypeTarget.STATISTIC,
//         TypeTarget.EVENT,
//       ].map((type) => ({
//         ...baseTask,
//         type,
//         id: faker.string.uuid(),
//         targetState: TargetState.ACTIVE,
//         dateComplete: new Date('2024-09-18T14:59:47.010Z'),
//         createdAt: new Date('2024-09-18T14:59:47.010Z'),
//         updatedAt: new Date('2024-09-18T14:59:47.010Z'),
//         targetHolders: null,
//         isExpired: true,
//       }));
//       const existingProjects: ProjectReadDto[] = [
//         {
//           id: faker.string.uuid(),
//           projectNumber: faker.number.int(),
//           projectName: faker.book.title(),
//           programId: faker.string.uuid(),
//           content: faker.string.sample(),
//           type: Type.PROJECT,
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           organization: organization,
//           targets: targets,
//           strategy: null,
//           account: null,
//           user: null,
//         },
//         {
//           id: faker.string.uuid(),
//           projectNumber: faker.number.int(),
//           projectName: faker.book.title(),
//           programId: faker.string.uuid(),
//           content: faker.string.sample(),
//           type: Type.PROJECT,
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           organization: organization,
//           targets: targets,
//           strategy: null,
//           account: null,
//           user: null,
//         },
//       ];

//       const projectRepositoryFindAllSpy = jest
//         .spyOn(projectRepository, 'find')
//         .mockResolvedValue(existingProjects);

//       const result = await projectService.findAllForOrganization(
//         organization.id,
//       );
//       expect(result).toEqual(existingProjects);
//       expect(projectRepositoryFindAllSpy).toHaveBeenCalledWith({
//         where: { organization: { id: organization.id } },
//         relations: ['targets'],
//       });
//     });
//   });

//   describe('finding all programs by account', () => {
//     it('returns all programs by account', async () => {
//       const account: Account = {
//         id: faker.string.uuid(),
//         accountName: faker.company.name(),
//         tenantId: faker.string.uuid(),
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         users: {} as any,
//         organizations: {} as any,
//         goals: {} as any,
//         objectives: {} as any,
//         policies: {} as any,
//         projects: {} as any,
//         strategies: {} as any,
//         posts: {} as any,
//         statistics: {} as any,
//         roleSettings: {} as any,
//         policyDirectories: {} as any,
//         converts: {} as any,
//         groups: {} as any,
//       };

//       const baseTask = {
//         orderNumber: 1,
//         content: 'Контент задачи',
//         holderUserId: '3b809c42-2824-46c1-9686-dd666403402a',
//         dateStart: new Date('2024-09-18T14:59:47.010Z'),
//         deadline: new Date('2024-09-18T14:59:47.010Z'),
//         holderUser: null,
//         project: null,
//       };
//       const targets: Target[] = [
//         TypeTarget.PRODUCT,
//         TypeTarget.COMMON,
//         TypeTarget.RULE,
//         TypeTarget.STATISTIC,
//         TypeTarget.EVENT,
//       ].map((type) => ({
//         ...baseTask,
//         type,
//         id: faker.string.uuid(),
//         targetState: TargetState.ACTIVE,
//         dateComplete: new Date('2024-09-18T14:59:47.010Z'),
//         createdAt: new Date('2024-09-18T14:59:47.010Z'),
//         updatedAt: new Date('2024-09-18T14:59:47.010Z'),
//         targetHolders: null,
//         isExpired: true,
//       }));
//       const existingPrograms: ProjectReadDto[] = [
//         {
//           id: faker.string.uuid(),
//           projectNumber: faker.number.int(),
//           projectName: faker.book.title(),
//           programId: faker.string.uuid(),
//           content: faker.string.sample(),
//           type: Type.PROGRAM,
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           organization: null,
//           targets: targets,
//           strategy: null,
//           account: account,
//           user: {} as any,
//         },
//         {
//           id: faker.string.uuid(),
//           projectNumber: faker.number.int(),
//           projectName: faker.book.title(),
//           programId: faker.string.uuid(),
//           content: faker.string.sample(),
//           type: Type.PROGRAM,
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           organization: null,
//           targets: targets,
//           strategy: null,
//           account: account,
//           user: {} as any,
//         },
//       ];

//       const projectRepositoryFindAllSpy = jest
//         .spyOn(projectRepository, 'find')
//         .mockResolvedValue(existingPrograms);

//       const result = await projectService.findAllProgramsForAccount(account);
//       expect(result).toEqual(existingPrograms);
//       expect(projectRepositoryFindAllSpy).toHaveBeenCalledWith({
//         where: { type: Type.PROGRAM, account: { id: account.id } },
//         relations: ['organization', 'targets', 'strategy'],
//       });
//     });
//   });

//   describe('finding all project without program by account', () => {
//     it('returns all projects without program by account', async () => {
//       const account: Account = {
//         id: faker.string.uuid(),
//         accountName: faker.company.name(),
//         tenantId: faker.string.uuid(),
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         users: {} as any,
//         organizations: {} as any,
//         goals: {} as any,
//         objectives: {} as any,
//         policies: {} as any,
//         projects: {} as any,
//         strategies: {} as any,
//         posts: {} as any,
//         statistics: {} as any,
//         roleSettings: {} as any,
//         policyDirectories: {} as any,
//         converts: {} as any,
//         groups: {} as any,
//       };

//       const baseTask = {
//         orderNumber: 1,
//         content: 'Контент задачи',
//         holderUserId: '3b809c42-2824-46c1-9686-dd666403402a',
//         dateStart: new Date('2024-09-18T14:59:47.010Z'),
//         deadline: new Date('2024-09-18T14:59:47.010Z'),
//         holderUser: null,
//         project: null,
//       };
//       const targets: Target[] = [
//         TypeTarget.PRODUCT,
//         TypeTarget.COMMON,
//         TypeTarget.RULE,
//         TypeTarget.STATISTIC,
//         TypeTarget.EVENT,
//       ].map((type) => ({
//         ...baseTask,
//         type,
//         id: faker.string.uuid(),
//         targetState: TargetState.ACTIVE,
//         dateComplete: new Date('2024-09-18T14:59:47.010Z'),
//         createdAt: new Date('2024-09-18T14:59:47.010Z'),
//         updatedAt: new Date('2024-09-18T14:59:47.010Z'),
//         targetHolders: null,
//         isExpired: true,
//       }));
//       const existingProjects: ProjectReadDto[] = [
//         {
//           id: faker.string.uuid(),
//           projectNumber: faker.number.int(),
//           projectName: faker.book.title(),
//           programId: {} as any,
//           content: faker.string.sample(),
//           type: Type.PROJECT,
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           organization: null,
//           targets: targets,
//           strategy: null,
//           account: account,
//           user: {} as any,
//         },
//         {
//           id: faker.string.uuid(),
//           projectNumber: faker.number.int(),
//           projectName: faker.book.title(),
//           programId: {} as any,
//           content: faker.string.sample(),
//           type: Type.PROGRAM,
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           organization: null,
//           targets: targets,
//           strategy: null,
//           account: account,
//           user: {} as any,
//         },
//       ];

//       const projectRepositoryFindAllSpy = jest
//         .spyOn(projectRepository, 'find')
//         .mockResolvedValue(existingProjects);

//       const result =
//         await projectService.findAllProjectsWithoutProgramForAccount(account);
//       expect(result).toEqual(existingProjects);
//       expect(projectRepositoryFindAllSpy).toHaveBeenCalledWith({
//         where: {
//           type: Type.PROJECT,
//           programId: IsNull(),
//           account: { id: account.id },
//         },
//         relations: ['organization', 'targets'],
//       });
//     });
//   });

//   // describe('finding all projects by programId', () => {
//   //   it('returns all projects by programId', async () => {

//   //     const programId = faker.string.uuid()
//   //     const baseTask = {
//   //       orderNumber: 1,
//   //       content: 'Контент задачи',
//   //       holderUserId: '3b809c42-2824-46c1-9686-dd666403402a',
//   //       dateStart: new Date('2024-09-18T14:59:47.010Z'),
//   //       deadline: new Date('2024-09-18T14:59:47.010Z'),
//   //       holderUser: null,
//   //       project: null,
//   //     };
//   //     const targets: Target[] = [
//   //       TypeTarget.PRODUCT,
//   //       TypeTarget.COMMON,
//   //       TypeTarget.RULE,
//   //       TypeTarget.STATISTIC,
//   //       TypeTarget.EVENT,
//   //     ].map((type) => ({
//   //       ...baseTask,
//   //       type,
//   //       id: faker.string.uuid(),
//   //       targetState: TargetState.ACTIVE,
//   //       dateComplete: new Date('2024-09-18T14:59:47.010Z'),
//   //       createdAt: new Date('2024-09-18T14:59:47.010Z'),
//   //       updatedAt: new Date('2024-09-18T14:59:47.010Z'),
//   //       targetHolders: null,
//   //       isExpired: true,
//   //     }));
//   //     const existingProjects: ProjectReadDto[] = [
//   //       {
//   //         id: faker.string.uuid(),
//   //         projectNumber: faker.number.int(),
//   //         projectName: faker.book.title(),
//   //         programId: programId,
//   //         content: faker.string.sample(),
//   //         type: Type.PROJECT,
//   //         createdAt: new Date(),
//   //         updatedAt: new Date(),
//   //         organization: {} as any,
//   //         targets: targets,
//   //         strategy: {} as any,
//   //         account: {} as any,
//   //         user: {} as any,
//   //       },
//   //       {
//   //         id: faker.string.uuid(),
//   //         projectNumber: faker.number.int(),
//   //         projectName: faker.book.title(),
//   //         programId: programId,
//   //         content: faker.string.sample(),
//   //         type: Type.PROGRAM,
//   //         createdAt: new Date(),
//   //         updatedAt: new Date(),
//   //         organization: {} as any,
//   //         targets: targets,
//   //         strategy: {} as any,
//   //         account: {} as any,
//   //         user: {} as any,
//   //       },
//   //     ];

//   //     const projectRepositoryFindAllSpy = jest
//   //       .spyOn(projectRepository, 'find')
//   //       .mockResolvedValue(existingProjects);

//   //     const result = await projectService.findAllProjectsByProgramId(programId);
//   //     expect(result).toEqual(existingProjects);
//   //     expect(projectRepositoryFindAllSpy).toHaveBeenCalledWith({
//   //       where: { programId: programId },
//   //       relations: ['targets.targetHolders.user'],
//   //     });
//   //   });
//   // });

//   describe('finding a project by id', () => {
//     it('throws an error when a project doesnt exist', async () => {
//       const id = faker.string.uuid();

//       const leftJoinAndSelectSpy = jest.fn().mockReturnThis();
//       const whereSpy = jest.fn().mockReturnThis();
//       const getOneSpy = jest.fn().mockResolvedValue(null);

//       jest.spyOn(projectRepository, 'createQueryBuilder').mockReturnValue({
//         leftJoinAndSelect: leftJoinAndSelectSpy,
//         where: whereSpy,
//         getOne: getOneSpy,
//       } as any);

//       expect.assertions(7);

//       try {
//         await projectService.findOneById(id);
//       } catch (e) {
//         expect(e).toBeInstanceOf(NotFoundException);
//         expect(e.message).toBe(`Проект с ID: ${id} не найден`);
//       }
//       // Теперь можно проверять вызовы методов
//       expect(projectRepository.createQueryBuilder).toHaveBeenCalled();
//       expect(leftJoinAndSelectSpy).toHaveBeenCalledWith('project.strategy', 'strategy');
//       expect(leftJoinAndSelectSpy).toHaveBeenCalledWith('project.targets', 'targets');
//       // и так далее для остальных вызовов
//       expect(whereSpy).toHaveBeenCalledWith('project.id = :id', { id });
//       expect(getOneSpy).toHaveBeenCalled();
//     });

//     it('returns the project', async () => {
//       const id = faker.string.uuid();
//       const programId = faker.string.uuid();


//       const baseTask = {
//         orderNumber: 1,
//         content: 'Контент задачи',
//         holderUserId: '3b809c42-2824-46c1-9686-dd666403402a',
//         dateStart: new Date('2024-09-18T14:59:47.010Z'),
//         deadline: new Date('2024-09-18T14:59:47.010Z'),
//         holderUser: null,
//         project: null,
//       };
//       const targets: Target[] = [
//         TypeTarget.PRODUCT,
//         TypeTarget.COMMON,
//         TypeTarget.RULE,
//         TypeTarget.STATISTIC,
//         TypeTarget.EVENT,
//       ].map((type) => ({
//         ...baseTask,
//         type,
//         id: faker.string.uuid(),
//         targetState: TargetState.ACTIVE,
//         dateComplete: new Date('2024-09-18T14:59:47.010Z'),
//         createdAt: new Date('2024-09-18T14:59:47.010Z'),
//         updatedAt: new Date('2024-09-18T14:59:47.010Z'),
//         targetHolders: null,
//         isExpired: true,
//       }));

//       const existingProgram: ProjectReadDto =
//       {
//         id: programId,
//         projectNumber: faker.number.int(),
//         projectName: faker.book.title(),
//         programId: faker.string.uuid(),
//         content: faker.string.sample(),
//         type: Type.PROGRAM,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         organization: {} as any,
//         targets: targets,
//         strategy: {} as any,
//         account: {} as any,
//         user: {} as any,
//       }
//       const existingProject: ProjectReadDto =
//       {
//         id: id,
//         projectNumber: faker.number.int(),
//         projectName: faker.book.title(),
//         programId: programId,
//         programNumber: existingProgram.projectNumber,
//         content: faker.string.sample(),
//         type: Type.PROJECT,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         organization: {} as any,
//         targets: targets,
//         strategy: {} as any,
//         account: {} as any,
//         user: {} as any,
//       }

//       const leftJoinAndSelectSpy = jest.fn().mockReturnThis();
//       const whereSpy = jest.fn().mockReturnThis();
//       const getOneSpy = jest.fn().mockResolvedValue(existingProject);
//       const projectRepositoryFindOneSpy = jest
//         .spyOn(projectRepository, 'findOne')
//         .mockResolvedValue(existingProgram);

//       jest.spyOn(projectRepository, 'createQueryBuilder').mockReturnValue({
//         leftJoinAndSelect: leftJoinAndSelectSpy,
//         where: whereSpy,
//         getOne: getOneSpy,
//       } as any);

//       const result = await projectService.findOneById(id);
//       expect(result).toEqual(existingProject)

//       // Теперь можно проверять вызовы методов
//       expect(projectRepository.createQueryBuilder).toHaveBeenCalled();
//       expect(leftJoinAndSelectSpy).toHaveBeenCalledWith('project.strategy', 'strategy');
//       expect(leftJoinAndSelectSpy).toHaveBeenCalledWith('project.targets', 'targets');
//       expect(leftJoinAndSelectSpy).toHaveBeenCalledWith('targets.targetHolders', 'targetHolders');
//       expect(leftJoinAndSelectSpy).toHaveBeenCalledWith('targetHolders.user', 'user');
//       expect(leftJoinAndSelectSpy).toHaveBeenCalledWith('project.organization', 'organization');
//       // и так далее для остальных вызовов
//       expect(whereSpy).toHaveBeenCalledWith('project.id = :id', { id });
//       expect(getOneSpy).toHaveBeenCalled();

//       expect(projectRepositoryFindOneSpy).toHaveBeenCalledWith({
//         where: { id: programId },
//       });
//     });

//   });

//   describe('finding a program by id', () => {
//     it('throws an error when a program doesnt exist', async () => {
//       const id = faker.string.uuid();

//       const projectRepositoryFindOneSpy = jest
//         .spyOn(projectRepository, 'findOne')
//         .mockResolvedValue(null);

//       expect.assertions(3);

//       try {
//         await projectService.findOneProgramById(id);
//       } catch (e) {
//         expect(e).toBeInstanceOf(NotFoundException);
//         expect(e.message).toBe(`Проект с ID: ${id} не найден`);
//       }

//       expect(projectRepositoryFindOneSpy).toHaveBeenCalledWith({
//         where: { id: id },
//         relations: ['targets.targetHolders.user', 'organization', 'strategy'],
//       });
//     });

//     it('returns the found program', async () => {
//       const id = faker.string.uuid();

//       const baseTask = {
//         orderNumber: 1,
//         content: 'Контент задачи',
//         holderUserId: '3b809c42-2824-46c1-9686-dd666403402a',
//         dateStart: new Date('2024-09-18T14:59:47.010Z'),
//         deadline: new Date('2024-09-18T14:59:47.010Z'),
//         holderUser: {} as any,
//         project: {} as any,
//       };
//       const targets: Target[] = [
//         TypeTarget.PRODUCT,
//         TypeTarget.COMMON,
//         TypeTarget.RULE,
//         TypeTarget.STATISTIC,
//         TypeTarget.EVENT,
//       ].map((type) => ({
//         ...baseTask,
//         type,
//         id: faker.string.uuid(),
//         targetState: TargetState.ACTIVE,
//         dateComplete: new Date('2024-09-18T14:59:47.010Z'),
//         createdAt: new Date('2024-09-18T14:59:47.010Z'),
//         updatedAt: new Date('2024-09-18T14:59:47.010Z'),
//         targetHolders: {} as any,
//       }));

//       const existingProgram: ProjectReadDto = {
//         id: id,
//         projectNumber: faker.number.int(),
//         projectName: faker.book.title(),
//         programId: faker.string.uuid(),
//         content: faker.string.sample(),
//         type: Type.PROGRAM,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         organization: {} as any,
//         targets: targets.map((target) => ({
//           ...target,
//           isExpired: target.deadline
//             ? new Date(target.deadline) < new Date()
//             : false,
//         })),
//         strategy: {} as any,
//         account: {} as any,
//         user: {} as any,
//       };

//       const projectRepositoryFindOneSpy = jest
//         .spyOn(projectRepository, 'findOne')
//         .mockResolvedValue(existingProgram);

//       const result = await projectService.findOneProgramById(id);
//       expect(result).toEqual(existingProgram);
//       expect(projectRepositoryFindOneSpy).toHaveBeenCalledWith({
//         where: { id: id },
//         relations: ['targets.targetHolders.user', 'organization', 'strategy'],
//       });
//     });
//   });

//   // describe('finding all projects by programId', () => {
//   //   it('returns all projects by programId', async () => {
//   //     const programId = faker.string.uuid();

//   //     const baseTask = {
//   //       orderNumber: 1,
//   //       content: 'Контент задачи',
//   //       holderUserId: '3b809c42-2824-46c1-9686-dd666403402a',
//   //       dateStart: new Date('2024-09-18T14:59:47.010Z'),
//   //       deadline: new Date('2024-09-18T14:59:47.010Z'),
//   //       holderUser: {} as any,
//   //       project: {} as any,
//   //     };
//   //     const targets: Target[] = [
//   //       TypeTarget.PRODUCT,
//   //       TypeTarget.COMMON,
//   //       TypeTarget.RULE,
//   //       TypeTarget.STATISTIC,
//   //       TypeTarget.EVENT,
//   //     ].map((type) => ({
//   //       ...baseTask,
//   //       type,
//   //       id: faker.string.uuid(),
//   //       targetState: TargetState.ACTIVE,
//   //       dateComplete: new Date('2024-09-18T14:59:47.010Z'),
//   //       createdAt: new Date('2024-09-18T14:59:47.010Z'),
//   //       updatedAt: new Date('2024-09-18T14:59:47.010Z'),
//   //       targetHolders: {} as any,
//   //       isExpired: true,
//   //     }));
//   //     const existingProjects: ProjectReadDto[] = [
//   //       {
//   //         id: faker.string.uuid(),
//   //         projectNumber: faker.number.int(),
//   //         projectName: faker.book.title(),
//   //         programId: programId,
//   //         content: faker.string.sample(),
//   //         type: Type.PROJECT,
//   //         createdAt: new Date(),
//   //         updatedAt: new Date(),
//   //         organization: {} as any,
//   //         targets: targets,
//   //         strategy: {} as any,
//   //         account: {} as any,
//   //         user: {} as any,
//   //       },
//   //       {
//   //         id: faker.string.uuid(),
//   //         projectNumber: faker.number.int(),
//   //         projectName: faker.book.title(),
//   //         programId: programId,
//   //         content: faker.string.sample(),
//   //         type: Type.PROJECT,
//   //         createdAt: new Date(),
//   //         updatedAt: new Date(),
//   //         organization: {} as any,
//   //         targets: targets,
//   //         strategy: {} as any,
//   //         account: {} as any,
//   //         user: {} as any,
//   //       },
//   //     ];

//   //     const projectRepositoryFindAllSpy = jest
//   //       .spyOn(projectRepository, 'find')
//   //       .mockResolvedValue(existingProjects);

//   //     const result = await projectService.findAllProjectsByProgramId(programId);
//   //     expect(result).toEqual(existingProjects);
//   //     expect(projectRepositoryFindAllSpy).toHaveBeenCalledWith({
//   //       where: { programId: programId },
//   //       relations: ['targets.targetHolders.user'],
//   //     });
//   //   });
//   // });

//   describe('creating a project', () => {
//     it('calls the repository with correct paramaters', async () => {
//       const projectName = faker.book.title();
//       const programId = faker.string.uuid();
//       const content = faker.string.sample();
//       const type = Type.PROJECT;
//       const organizationId = faker.string.uuid();
//       const strategyId = faker.string.uuid();

//       const organization: Organization = {
//         id: organizationId,
//         organizationName: faker.company.name(),
//         parentOrganizationId: {} as any,
//         reportDay: ReportDay.FRIDAY,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         goal: {} as any,
//         users: {} as any,
//         posts: {} as any,
//         policies: {} as any,
//         projects: {} as any,
//         strategies: {} as any,
//         account: {} as any,
//       };

//       const strategy: Strategy = {
//         id: strategyId,
//         strategyNumber: faker.number.int(),
//         dateActive: new Date(),
//         content: faker.animal.bear(),
//         state: State.ACTIVE,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         user: {} as any,
//         account: {} as any,
//         organization: organization,
//         objective: {} as any,
//         projects: {} as any,
//       };

//       const baseTask = {
//         orderNumber: 1,
//         content: 'Контент задачи',
//         holderUserId: '3b809c42-2824-46c1-9686-dd666403402a',
//         dateStart: new Date('2024-09-18T14:59:47.010Z'),
//         deadline: new Date('2024-09-18T14:59:47.010Z'),
//         holderUser: {} as any,
//         project: {} as any,
//       };

//       const targetCreateDtos: TargetCreateDto[] = [
//         TypeTarget.PRODUCT,
//         TypeTarget.COMMON,
//         TypeTarget.RULE,
//         TypeTarget.STATISTIC,
//         TypeTarget.EVENT,
//       ].map((type) => ({ ...baseTask, type }));

//       const targets: Target[] = [
//         TypeTarget.PRODUCT,
//         TypeTarget.COMMON,
//         TypeTarget.RULE,
//         TypeTarget.STATISTIC,
//         TypeTarget.EVENT,
//       ].map((type) => ({
//         ...baseTask,
//         type,
//         id: faker.string.uuid(),
//         targetState: TargetState.ACTIVE,
//         dateComplete: new Date('2024-09-18T14:59:47.010Z'),
//         createdAt: new Date('2024-09-18T14:59:47.010Z'),
//         updatedAt: new Date('2024-09-18T14:59:47.010Z'),
//         targetHolders: {} as any,
//       }));

//       const projectCreateDto: ProjectCreateDto = {
//         projectName: projectName,
//         programId: programId,
//         content: content,
//         type: type,
//         organizationId: organizationId,
//         strategyId: strategyId,
//         targetCreateDtos: targetCreateDtos,
//         user: {} as any,
//         strategy: strategy,
//         account: {} as any,
//         organization: organization,
//       };
//       const savedProject: Project = {
//         id: faker.string.uuid(),
//         projectNumber: faker.number.int(),
//         projectName: projectName,
//         programId: programId,
//         content: content,
//         type: type,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         organization: organization,
//         targets: targets,
//         strategy: strategy,
//         account: {} as any,
//         user: {} as any,
//       };
//       const projectRepositoryInsertSpy = jest
//         .spyOn(projectRepository, 'insert')
//         .mockResolvedValue({
//           identifiers: [{ id: savedProject.id }],
//           generatedMaps: [],
//           raw: [],
//         });

//       const result = await projectService.create(projectCreateDto);

//       expect(projectRepositoryInsertSpy).toHaveBeenCalledWith(
//         expect.objectContaining({
//           projectName: projectName,
//           programId: programId,
//           content: content,
//           type: type,
//           user: {} as any,
//           strategy: strategy,
//           account: {} as any,
//           organization: organization,
//         }),
//       );
//       expect(result).toEqual(savedProject.id);
//     });
//   });

//   describe('updating a project', () => {
//     it('calls the repository with correct paramaters', async () => {
//       const _id = faker.string.uuid();
//       const projectName = faker.book.title();
//       const programId = faker.string.uuid();
//       const content = faker.string.sample();
//       const type = Type.PROJECT;
//       const organizationId = faker.string.uuid();
//       const strategyId = faker.string.uuid();
//       //   targetCreateDtos?: TargetCreateDto[];
//       //   targetUpdateDtos?: TargetUpdateDto[];

//       const organization: Organization = {
//         id: organizationId,
//         organizationName: faker.company.name(),
//         parentOrganizationId: {} as any,
//         reportDay: ReportDay.FRIDAY,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         goal: {} as any,
//         users: {} as any,
//         posts: {} as any,
//         policies: {} as any,
//         projects: {} as any,
//         strategies: {} as any,
//         account: {} as any,
//       };

//       const strategy: Strategy = {
//         id: strategyId,
//         strategyNumber: faker.number.int(),
//         dateActive: new Date(),
//         content: faker.animal.bear(),
//         state: State.ACTIVE,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         user: {} as any,
//         account: {} as any,
//         organization: organization,
//         objective: {} as any,
//         projects: {} as any,
//       };

//       const baseTask = {
//         orderNumber: 1,
//         content: 'Контент задачи',
//         holderUserId: '3b809c42-2824-46c1-9686-dd666403402a',
//         dateStart: new Date('2024-09-18T14:59:47.010Z'),
//         deadline: new Date('2024-09-18T14:59:47.010Z'),
//         holderUser: {} as any,
//         project: {} as any,
//       };

//       const targetCreateDtos: TargetCreateDto[] = [
//         TypeTarget.PRODUCT,
//         TypeTarget.COMMON,
//         TypeTarget.RULE,
//         TypeTarget.STATISTIC,
//         TypeTarget.EVENT,
//       ].map((type) => ({ ...baseTask, type }));

//       const targets: Target[] = [
//         TypeTarget.PRODUCT,
//         TypeTarget.COMMON,
//         TypeTarget.RULE,
//         TypeTarget.STATISTIC,
//         TypeTarget.EVENT,
//       ].map((type) => ({
//         ...baseTask,
//         type,
//         id: faker.string.uuid(),
//         targetState: TargetState.ACTIVE,
//         dateComplete: new Date('2024-09-18T14:59:47.010Z'),
//         createdAt: new Date('2024-09-18T14:59:47.010Z'),
//         updatedAt: new Date('2024-09-18T14:59:47.010Z'),
//         targetHolders: {} as any,
//       }));

//       const projectUpdateDto: ProjectUpdateDto = {
//         _id: _id,
//         projectName: projectName,
//         programId: programId,
//         content: content,
//         type: type,
//         organizationId: organizationId,
//         strategyId: strategyId,
//         targetCreateDtos: targetCreateDtos,
//         strategy: strategy,
//         organization: organization,
//       };
//       const existedProject: Project = {
//         id: _id,
//         projectNumber: faker.number.int(),
//         projectName: projectName,
//         programId: programId,
//         content: content,
//         type: type,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         organization: organization,
//         targets: targets,
//         strategy: strategy,
//         account: {} as any,
//         user: {} as any,
//       };

//       const projectRepositoryFindOneSpy = jest
//         .spyOn(projectRepository, 'findOne')
//         .mockResolvedValue(existedProject);

//       const projectRepositoryUpdateSpy = jest
//         .spyOn(projectRepository, 'update')
//         .mockResolvedValue({
//           generatedMaps: [],
//           raw: [],
//           affected: 1
//         });

//       const result = await projectService.update(_id, projectUpdateDto);


//       expect(result).toMatch(existedProject.id);
//       expect(projectRepositoryFindOneSpy).toHaveBeenCalledWith({
//         where: { id: _id },
//         relations: ['strategy'],
//       });
//       expect(projectRepositoryUpdateSpy).toHaveBeenCalledWith(
//         _id,
//         expect.objectContaining({
//           projectName: projectName,
//           programId: programId,
//           content: content,
//           type: type,
//           strategy: strategy,
//           organization: organization,
//         }),
//       );
//     });
//   });
// });
