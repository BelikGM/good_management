// import { Test, TestingModule } from '@nestjs/testing';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { WinstonModule } from 'nest-winston';
// import { GoalService } from 'src/application/services/goal/goal.service';
// import { GoalRepository } from 'src/application/services/goal/repository/goal.repository';
// import { Goal } from 'src/domains/goal.entity';
// import { winstonConfig } from 'src/utils/winston-logger';
// import { RepositoryFake } from '../FakeClasses/repositoryFake';
// import { BadRequestException, NotFoundException } from '@nestjs/common';
// import { faker } from '@faker-js/faker/.';
// import { GoalCreateDto } from 'src/contracts/goal/create-goal.dto';
// import { Organization, ReportDay } from 'src/domains/organization.entity';
// import { GoalReadDto } from 'src/contracts/goal/read-goal.dto';
// import { Account } from 'src/domains/account.entity';
// import { GoalUpdateDto } from 'src/contracts/goal/update-goal.dto';

// describe('GoalService', () => {
//   let goalService: GoalService;
//   let goalRepository: GoalRepository;
//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       imports: [WinstonModule.forRoot(winstonConfig)],
//       providers: [
//         GoalService,
//         {
//           provide: getRepositoryToken(Goal),
//           useClass: RepositoryFake,
//         },
//       ],
//     }).compile();
//     goalService = module.get(GoalService);
//     goalRepository = module.get(getRepositoryToken(Goal));
//   });

//   describe('creating a goal', () => {

//     it('calls the repository with correct paramaters', async () => {
//       const content = faker.helpers.multiple(() => faker.animal.cat(), {
//         count: 3,
//       });
//       const organizationId = faker.string.uuid();

//       const organization: Organization = {
//         id: organizationId,
//         organizationName: faker.company.name(),
//         parentOrganizationId: null,
//         reportDay: ReportDay.FRIDAY,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         goal: null,
//         users: null,
//         posts: null,
//         policies: null,
//         projects: null,
//         strategies: null,
//         account: null,
//       };

//       const goalCreateDto: GoalCreateDto = {
//         content: content,
//         organizationId: organizationId,
//         user: null,
//         account: null,
//         organization: organization,
//       };

//       const savedGoal: Goal = {
//         id: faker.string.uuid(),
//         content: content,
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         user: null,
//         account: null,
//         organization: organization,
//       };

//       const goalRepositoryInsertSpy = jest
//         .spyOn(goalRepository, 'insert')
//         .mockResolvedValue({
//           identifiers: [{ id: savedGoal.id }],
//           generatedMaps: [],
//           raw: [],
//         });

//       const result = await goalService.create(goalCreateDto);

//       expect(goalRepositoryInsertSpy).toHaveBeenCalledWith(
//         expect.objectContaining({
//           content: goalCreateDto.content,
//           organization: goalCreateDto.organization,
//         }),
//       );
//       expect(result).toEqual(savedGoal.id);
//     });
//   });

//   describe('finding a goal', () => {
//     it('throws an error when a goal doesnt exist', async () => {
//       const goalId = faker.string.uuid();

//       const goalRepositoryFindOneSpy = jest
//         .spyOn(goalRepository, 'findOne')
//         .mockResolvedValue(null);

//       expect.assertions(3);

//       try {
//         await goalService.findOneById(goalId, ['organization']);
//       } catch (e) {
//         expect(e).toBeInstanceOf(NotFoundException);
//         expect(e.message).toBe(`Цель с ID: ${goalId} не найдена!`);
//       }

//       expect(goalRepositoryFindOneSpy).toHaveBeenCalledWith({
//         where: { id: goalId },
//         relations: ['organization'],
//       });
//     });

//     it('returns the found goal', async () => {
//       const goalId = faker.string.uuid();

//       const existingGoal: GoalReadDto = {
//         id: goalId,
//         content: faker.helpers.multiple(() => faker.animal.cat(), {
//           count: 3,
//         }),
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         organization: {
//           id: faker.string.uuid(),
//           organizationName: faker.company.name(),
//           parentOrganizationId: null,
//           reportDay: ReportDay.FRIDAY,
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           goal: null,
//           users: null,
//           posts: null,
//           policies: null,
//           projects: null,
//           strategies: null,
//           account: null,
//         },
//       };

//       const goalRepositoryFindOneSpy = jest
//         .spyOn(goalRepository, 'findOne')
//         .mockResolvedValue(existingGoal as Goal);

//       const result = await goalService.findOneById(goalId, ['organization']);
//       expect(result).toMatchObject<GoalReadDto>(existingGoal);
//       expect(goalRepositoryFindOneSpy).toHaveBeenCalledWith({
//         where: { id: goalId },
//         relations: ['organization'],
//       });
//     });
//   });


//   describe('finding all goals', () => {


//     it('returns all goals', async () => {

//       const account: Account = {
//         id: faker.string.uuid(),
//         accountName: faker.company.name(),
//         tenantId: faker.string.uuid(),
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         users: null,
//         organizations: null,
//         goals: null,
//         objectives: null,
//         policies: null,
//         projects: null,
//         strategies: null,
//         posts: null,
//         statistics: null,
//         roleSettings: null,
//         policyDirectories: null,
//         converts: null,
//         groups: null,
//       };

//       const existingGoals: GoalReadDto[] = [
//         {
//           id: faker.string.uuid(),
//           content: faker.helpers.multiple(() => faker.animal.cat(), {
//             count: 3,
//           }),
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           user: {} as any,
//           account: account,
//           organization: {} as any,
//         },
//         {
//           id: faker.string.uuid(),
//           content: faker.helpers.multiple(() => faker.animal.cat(), {
//             count: 3,
//           }),
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           user: {} as any,
//           account: account,
//           organization: {} as any,
//         },
//         {
//           id: faker.string.uuid(),
//           content: faker.helpers.multiple(() => faker.animal.cat(), {
//             count: 3,
//           }),
//           createdAt: new Date(),
//           updatedAt: new Date(),
//           user: {} as any,
//           account: {} as any,
//           organization: {} as any,
//         }
//       ]


//       const goalRepositoryFindAllSpy = jest
//         .spyOn(goalRepository, 'find')
//         .mockResolvedValue(existingGoals as Goal[]);

//       const result = await goalService.findAllForAccount(account, ['user']);
//       expect(result).toMatchObject(existingGoals);
//       expect(goalRepositoryFindAllSpy).toHaveBeenCalledWith({
//         where: { account: { id: account.id } },
//         relations: ['user'],
//       });
//     });
//   });


//   describe('updating a goal', () => {
//     it('throws an error when a goal doesnt exist', async () => {

//       const goalId = faker.string.uuid()
//       const updateGoalDto: GoalUpdateDto = {
//         _id: goalId,
//         content: faker.helpers.multiple(() => faker.animal.cat(), {
//           count: 3,
//         }),
//       }

//       const goalRepositoryFindOneSpy = jest
//         .spyOn(goalRepository, 'findOne')
//         .mockResolvedValue(null);

//       expect.assertions(3);

//       try {
//         await goalService.update(goalId, updateGoalDto);
//       } catch (e) {
//         expect(e).toBeInstanceOf(NotFoundException);
//         expect(e.message).toBe(`Цель с ID ${goalId} не найдена`);
//       }
//       expect(goalRepositoryFindOneSpy).toHaveBeenCalledWith({
//         where: { id: goalId }
//       });
//     });

//     it('returns the updated goalId', async () => {
//       const goalId = faker.string.uuid();

//       const updateGoalDto: GoalUpdateDto = {
//         _id: goalId,
//         content: faker.helpers.multiple(() => faker.animal.cat(), {
//           count: 3,
//         }),
//       }

//       const existingGoal: GoalReadDto = {
//         id: goalId,
//         content: faker.helpers.multiple(() => faker.animal.cat(), {
//           count: 3,
//         }),
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         organization: {} as any,
//         user: {} as any,
//         account: {} as any
//       };

//       const goalRepositoryFindOneSpy = jest
//         .spyOn(goalRepository, 'findOne')
//         .mockResolvedValue(existingGoal as Goal);

//       const goalRepositoryUpdateSpy = jest
//         .spyOn(goalRepository, 'update')
//         .mockResolvedValue({
//           generatedMaps: [],
//           raw: [],
//           affected: 1
//         });

//       const result = await goalService.update(goalId, updateGoalDto);
//       expect(result).toMatch(existingGoal.id);
//       expect(goalRepositoryFindOneSpy).toHaveBeenCalledWith({
//         where: { id: goalId }
//       });
//       expect(goalRepositoryUpdateSpy).toHaveBeenCalledWith(
//         goalId,
//         expect.objectContaining({
//         content: updateGoalDto.content
//       }));
//     });
//   });
// });
