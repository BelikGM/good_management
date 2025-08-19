// import { Test, TestingModule } from '@nestjs/testing';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { WinstonModule } from 'nest-winston';
// import { winstonConfig } from 'src/utils/winston-logger';
// import { RepositoryFake } from '../FakeClasses/repositoryFake';
// import { BadRequestException, NotFoundException } from '@nestjs/common';
// import { faker } from '@faker-js/faker/.';
// import { Account } from 'src/domains/account.entity';
// import { StatisticService } from 'src/application/services/statistic/statistic.service';
// import { StatisticRepository } from 'src/application/services/statistic/repository/statistic.repository';
// import { Statistic, Type } from 'src/domains/statistic.entity';
// import { StatisticReadDto } from 'src/contracts/statistic/read-statistic.dto';
// import { PostReadDto } from 'src/contracts/post/read-post.dto';
// import { StatisticCreateDto } from 'src/contracts/statistic/create-statistic.dto';
// import { StatisticUpdateDto } from 'src/contracts/statistic/update-statistic.dto';
// import { StrategyService } from 'src/application/services/strategy/strategy.service';
// import { State, Strategy } from 'src/domains/strategy.entity';
// import { StrategyRepository } from 'src/application/services/strategy/repository/strategy.repository';
// import { StrategyReadDto } from 'src/contracts/strategy/read-strategy.dto';
// import { Objective } from 'src/domains/objective.entity';
// import { FindOptionsWhere, In, IsNull, Not } from 'typeorm';
// import { Organization, ReportDay } from 'src/domains/organization.entity';
// import { StrategyCreateDto } from 'src/contracts/strategy/create-strategy.dto';
// import { StrategyUpdateDto } from 'src/contracts/strategy/update-strategy.dto';

// describe('GoalService', () => {
//     let strategyService: StrategyService;
//     let strategyRepository: StrategyRepository;
//     beforeEach(async () => {
//         const module: TestingModule = await Test.createTestingModule({
//             imports: [WinstonModule.forRoot(winstonConfig)],
//             providers: [
//                 StrategyService,
//                 {
//                     provide: getRepositoryToken(Strategy),
//                     useClass: RepositoryFake,
//                 },
//             ],
//         }).compile();
//         strategyService = module.get(StrategyService);
//         strategyRepository = module.get(getRepositoryToken(Strategy));
//     });


//     describe('finding all strategies', () => {


//         it('returns all strategies for account', async () => {

//             const account: Account = {
//                 id: faker.string.uuid(),
//                 accountName: faker.company.name(),
//                 tenantId: faker.string.uuid(),
//                 createdAt: new Date(),
//                 updatedAt: new Date(),
//                 users: null,
//                 organizations: null,
//                 goals: null,
//                 objectives: null,
//                 policies: null,
//                 projects: null,
//                 strategies: null,
//                 posts: null,
//                 statistics: null,
//                 roleSettings: null,
//                 policyDirectories: null,
//                 converts: null,
//                 groups: null,
//             };

//             const existingStrategies: StrategyReadDto[] = [
//                 {
//                     id: faker.string.uuid(),
//                     strategyNumber: faker.number.int(),
//                     dateActive: faker.date.anytime(),
//                     content: faker.finance.accountName(),
//                     state: State.ACTIVE,
//                     createdAt: new Date(),
//                     updatedAt: new Date(),
//                     user: {} as any,
//                     account: account,
//                     organization: {} as any,
//                     objective: {} as any,
//                     projects: {} as any,
//                 },
//                 {
//                     id: faker.string.uuid(),
//                     strategyNumber: faker.number.int(),
//                     dateActive: faker.date.anytime(),
//                     content: faker.finance.accountName(),
//                     state: State.ACTIVE,
//                     createdAt: new Date(),
//                     updatedAt: new Date(),
//                     user: {} as any,
//                     account: account,
//                     organization: {} as any,
//                     objective: {} as any,
//                     projects: {} as any,
//                 },
//                 {
//                     id: faker.string.uuid(),
//                     strategyNumber: faker.number.int(),
//                     dateActive: faker.date.anytime(),
//                     content: faker.finance.accountName(),
//                     state: State.ACTIVE,
//                     createdAt: new Date(),
//                     updatedAt: new Date(),
//                     user: {} as any,
//                     account: {} as any,
//                     organization: {} as any,
//                     objective: {} as any,
//                     projects: {} as any,
//                 }
//             ]


//             const strategyRepositoryFindAllSpy = jest
//                 .spyOn(strategyRepository, 'find')
//                 .mockResolvedValue(existingStrategies);

//             const result = await strategyService.findAllForAccount(account);
//             expect(result).toMatchObject(existingStrategies);
//             expect(strategyRepositoryFindAllSpy).toHaveBeenCalledWith({
//                 where: { account: { id: account.id } },
//             });
//         });

//         it('returns all active or draft strategies without objective for account', async () => {

//             const account: Account = {
//                 id: faker.string.uuid(),
//                 accountName: faker.company.name(),
//                 tenantId: faker.string.uuid(),
//                 createdAt: new Date(),
//                 updatedAt: new Date(),
//                 users: null,
//                 organizations: null,
//                 goals: null,
//                 objectives: null,
//                 policies: null,
//                 projects: null,
//                 strategies: null,
//                 posts: null,
//                 statistics: null,
//                 roleSettings: null,
//                 policyDirectories: null,
//                 converts: null,
//                 groups: null,
//             };

//             const objective: Objective = {
//                 id: faker.string.uuid(),
//                 situation: faker.helpers.multiple(() => faker.animal.cat(), {
//                     count: 3,
//                 }),
//                 content: faker.helpers.multiple(() => faker.animal.cat(), {
//                     count: 3,
//                 }),
//                 rootCause: faker.helpers.multiple(() => faker.animal.cat(), {
//                     count: 3,
//                 }),
//                 createdAt: new Date(),
//                 updatedAt: new Date(),
//                 strategy: {} as any,
//                 account: account,
//             }


//             const existingStrategies: StrategyReadDto[] = [
//                 {
//                     id: faker.string.uuid(),
//                     strategyNumber: faker.number.int(),
//                     dateActive: faker.date.anytime(),
//                     content: faker.finance.accountName(),
//                     state: State.ACTIVE,
//                     createdAt: new Date(),
//                     updatedAt: new Date(),
//                     user: {} as any,
//                     account: account,
//                     organization: {} as any,
//                     objective: objective,
//                     projects: {} as any,
//                 },
//                 {
//                     id: faker.string.uuid(),
//                     strategyNumber: faker.number.int(),
//                     dateActive: faker.date.anytime(),
//                     content: faker.finance.accountName(),
//                     state: State.REJECTED,
//                     createdAt: new Date(),
//                     updatedAt: new Date(),
//                     user: {} as any,
//                     account: account,
//                     organization: {} as any,
//                     objective: {} as any,
//                     projects: {} as any,
//                 },
//                 {
//                     id: faker.string.uuid(),
//                     strategyNumber: faker.number.int(),
//                     dateActive: faker.date.anytime(),
//                     content: faker.finance.accountName(),
//                     state: State.ACTIVE,
//                     createdAt: new Date(),
//                     updatedAt: new Date(),
//                     user: {} as any,
//                     account: {} as any,
//                     organization: {} as any,
//                     objective: {} as any,
//                     projects: {} as any,
//                 }
//             ]


//             const strategyRepositoryFindAllSpy = jest
//                 .spyOn(strategyRepository, 'find')
//                 .mockResolvedValue(existingStrategies);

//             const result = await strategyService.findAllActiveOrDraftWithoutObjectiveForAccount(account);
//             expect(result).toMatchObject(existingStrategies);
//             expect(strategyRepositoryFindAllSpy).toHaveBeenCalledWith({
//                 where: {
//                     account: { id: account.id },
//                     state: In([State.ACTIVE, State.DRAFT]),
//                     objective: { id: IsNull() },
//                 },
//                 relations: ['objective'],
//             });
//         });


//         it('returns all active strategies for account', async () => {

//             const account: Account = {
//                 id: faker.string.uuid(),
//                 accountName: faker.company.name(),
//                 tenantId: faker.string.uuid(),
//                 createdAt: new Date(),
//                 updatedAt: new Date(),
//                 users: null,
//                 organizations: null,
//                 goals: null,
//                 objectives: null,
//                 policies: null,
//                 projects: null,
//                 strategies: null,
//                 posts: null,
//                 statistics: null,
//                 roleSettings: null,
//                 policyDirectories: null,
//                 converts: null,
//                 groups: null,
//             };


//             const existingStrategies: StrategyReadDto[] = [
//                 {
//                     id: faker.string.uuid(),
//                     strategyNumber: faker.number.int(),
//                     dateActive: faker.date.anytime(),
//                     content: faker.finance.accountName(),
//                     state: State.ACTIVE,
//                     createdAt: new Date(),
//                     updatedAt: new Date(),
//                     user: {} as any,
//                     account: account,
//                     organization: {} as any,
//                     objective: {} as any,
//                     projects: {} as any,
//                 },
//                 {
//                     id: faker.string.uuid(),
//                     strategyNumber: faker.number.int(),
//                     dateActive: faker.date.anytime(),
//                     content: faker.finance.accountName(),
//                     state: State.REJECTED,
//                     createdAt: new Date(),
//                     updatedAt: new Date(),
//                     user: {} as any,
//                     account: account,
//                     organization: {} as any,
//                     objective: {} as any,
//                     projects: {} as any,
//                 },
//                 {
//                     id: faker.string.uuid(),
//                     strategyNumber: faker.number.int(),
//                     dateActive: faker.date.anytime(),
//                     content: faker.finance.accountName(),
//                     state: State.ACTIVE,
//                     createdAt: new Date(),
//                     updatedAt: new Date(),
//                     user: {} as any,
//                     account: {} as any,
//                     organization: {} as any,
//                     objective: {} as any,
//                     projects: {} as any,
//                 }
//             ]


//             const strategyRepositoryFindAllSpy = jest
//                 .spyOn(strategyRepository, 'find')
//                 .mockResolvedValue(existingStrategies);

//             const result = await strategyService.findAllActiveForAccount(account);
//             expect(result).toMatchObject(existingStrategies);
//             expect(strategyRepositoryFindAllSpy).toHaveBeenCalledWith({
//                 where: {
//                     account: { id: account.id },
//                     state: In([State.ACTIVE, State.DRAFT]), // Используем In для OR условия
//                 },
//                 relations: [],
//             });
//         });


//         it('returns all active strategies with objective for account', async () => {

//             const account: Account = {
//                 id: faker.string.uuid(),
//                 accountName: faker.company.name(),
//                 tenantId: faker.string.uuid(),
//                 createdAt: new Date(),
//                 updatedAt: new Date(),
//                 users: null,
//                 organizations: null,
//                 goals: null,
//                 objectives: null,
//                 policies: null,
//                 projects: null,
//                 strategies: null,
//                 posts: null,
//                 statistics: null,
//                 roleSettings: null,
//                 policyDirectories: null,
//                 converts: null,
//                 groups: null,
//             };

//             const objective: Objective = {
//                 id: faker.string.uuid(),
//                 situation: faker.helpers.multiple(() => faker.animal.cat(), {
//                     count: 3,
//                 }),
//                 content: faker.helpers.multiple(() => faker.animal.cat(), {
//                     count: 3,
//                 }),
//                 rootCause: faker.helpers.multiple(() => faker.animal.cat(), {
//                     count: 3,
//                 }),
//                 createdAt: new Date(),
//                 updatedAt: new Date(),
//                 strategy: {} as any,
//                 account: account,
//             }


//             const existingStrategies: StrategyReadDto[] = [
//                 {
//                     id: faker.string.uuid(),
//                     strategyNumber: faker.number.int(),
//                     dateActive: faker.date.anytime(),
//                     content: faker.finance.accountName(),
//                     state: State.ACTIVE,
//                     createdAt: new Date(),
//                     updatedAt: new Date(),
//                     user: {} as any,
//                     account: account,
//                     organization: {} as any,
//                     objective: objective,
//                     projects: {} as any,
//                 },
//                 {
//                     id: faker.string.uuid(),
//                     strategyNumber: faker.number.int(),
//                     dateActive: faker.date.anytime(),
//                     content: faker.finance.accountName(),
//                     state: State.REJECTED,
//                     createdAt: new Date(),
//                     updatedAt: new Date(),
//                     user: {} as any,
//                     account: account,
//                     organization: {} as any,
//                     objective: {} as any,
//                     projects: {} as any,
//                 },
//                 {
//                     id: faker.string.uuid(),
//                     strategyNumber: faker.number.int(),
//                     dateActive: faker.date.anytime(),
//                     content: faker.finance.accountName(),
//                     state: State.DRAFT,
//                     createdAt: new Date(),
//                     updatedAt: new Date(),
//                     user: {} as any,
//                     account: {} as any,
//                     organization: {} as any,
//                     objective: objective,
//                     projects: {} as any,
//                 }
//             ]


//             const strategyRepositoryFindAllSpy = jest
//                 .spyOn(strategyRepository, 'find')
//                 .mockResolvedValue(existingStrategies);

//             const result = await strategyService.findAllActiveWithObjectiveForAccount(account);
//             expect(result).toMatchObject(existingStrategies);
//             expect(strategyRepositoryFindAllSpy).toHaveBeenCalledWith({
//                 where: {
//                     account: { id: account.id },
//                     state: State.ACTIVE,
//                     objective: { id: Not(IsNull()) },
//                 },
//                 relations: ['objective'],
//             });
//         });

//     });

//     describe('finding a strategy', () => {
//         it('throws an error when a strategy doesnt exist', async () => {
//             const strategyId = faker.string.uuid();

//             const strategyRepositoryFindOneSpy = jest
//                 .spyOn(strategyRepository, 'findOne')
//                 .mockResolvedValue(null);

//             expect.assertions(3);

//             try {
//                 await strategyService.findOneById(strategyId);
//             } catch (e) {
//                 expect(e).toBeInstanceOf(NotFoundException);
//                 expect(e.message).toBe(`Стратегия с ID: ${strategyId} не найдена`);
//             }

//             expect(strategyRepositoryFindOneSpy).toHaveBeenCalledWith({
//                 where: { id: strategyId },
//                 relations: [],
//             });
//         });

//         it('returns the found statistic', async () => {
//             const strategyId = faker.string.uuid();

//             const existingStrategy: StrategyReadDto = {
//                 id: strategyId,
//                 strategyNumber: faker.number.int(),
//                 dateActive: faker.date.anytime(),
//                 content: faker.finance.accountName(),
//                 state: State.ACTIVE,
//                 createdAt: new Date(),
//                 updatedAt: new Date(),
//                 user: {} as any,
//                 account: {} as any,
//                 organization: {} as any,
//                 objective: {} as any,
//                 projects: {} as any,
//             }

//             const strategyRepositoryFindOneSpy = jest
//                 .spyOn(strategyRepository, 'findOne')
//                 .mockResolvedValue(existingStrategy);

//             const result = await strategyService.findOneById(strategyId);
//             expect(result).toMatchObject(existingStrategy);
//             expect(strategyRepositoryFindOneSpy).toHaveBeenCalledWith({
//                 where: { id: strategyId },
//                 relations: [],
//             });
//         });

//     });

//     describe('creating a strategy', () => {

//         it('calls the repository with correct paramaters', async () => {

//             const account: Account = {
//                 id: faker.string.uuid(),
//                 accountName: faker.company.name(),
//                 tenantId: faker.string.uuid(),
//                 createdAt: new Date(),
//                 updatedAt: new Date(),
//                 users: null,
//                 organizations: null,
//                 goals: null,
//                 objectives: null,
//                 policies: null,
//                 projects: null,
//                 strategies: null,
//                 posts: null,
//                 statistics: null,
//                 roleSettings: null,
//                 policyDirectories: null,
//                 converts: null,
//                 groups: null,
//             };

//             const organization: Organization = {
//                 id: faker.string.uuid(),
//                 organizationName: faker.company.name(),
//                 parentOrganizationId: null,
//                 reportDay: ReportDay.FRIDAY,
//                 createdAt: new Date(),
//                 updatedAt: new Date(),
//                 goal: null,
//                 users: null,
//                 posts: null,
//                 policies: null,
//                 projects: null,
//                 strategies: null,
//                 account: account
//             };
//             const content = faker.commerce.product();

//             const savedStrategy: Strategy = {
//                 id: faker.string.uuid(),
//                 strategyNumber: faker.number.int(),
//                 dateActive: faker.date.anytime(),
//                 content: faker.finance.accountName(),
//                 state: State.ACTIVE,
//                 createdAt: new Date(),
//                 updatedAt: new Date(),
//                 user: {} as any,
//                 account: account,
//                 organization: organization,
//                 objective: {} as any,
//                 projects: {} as any,
//             };

//             const strategyCreateDto: StrategyCreateDto = {
//                 content: content,
//                 organizationId: organization.id,
//                 user: {} as any,
//                 account: account,
//                 organization: organization,
//             }


//             const strategyRepositoryInsertSpy = jest
//                 .spyOn(strategyRepository, 'insert')
//                 .mockResolvedValue({
//                     identifiers: [{ id: savedStrategy.id }],
//                     generatedMaps: [],
//                     raw: [],
//                 });

//             const result = await strategyService.create(strategyCreateDto);

//             expect(strategyRepositoryInsertSpy).toHaveBeenCalledWith(
//                 expect.objectContaining({
//                     content: strategyCreateDto.content,
//                     user: strategyCreateDto.user,
//                     account: strategyCreateDto.account,
//                     organization: strategyCreateDto.organization,
//                 }),);
//             expect(result).toMatch(savedStrategy.id);
//         });
//     });


//     describe('updating a strategy', () => {
//         it('throws an error when a strategy doesnt exist', async () => {

//             const strategyId = faker.string.uuid()
//             const updateStrategyDto: StrategyUpdateDto = {
//                 _id: strategyId,
//                 state: State.ACTIVE,
//                 content: faker.commerce.product(),
//             }

//             const strategyRepositoryFindOneSpy = jest
//                 .spyOn(strategyRepository, 'findOne')
//                 .mockResolvedValue(null);

//             expect.assertions(3);

//             try {
//                 await strategyService.update(strategyId, updateStrategyDto);
//             } catch (e) {
//                 expect(e).toBeInstanceOf(NotFoundException);
//                 expect(e.message).toBe(`Стратегия с ID ${strategyId} не найдена`);
//             }
//             expect(strategyRepositoryFindOneSpy).toHaveBeenCalledWith({
//                 where: { id: strategyId },
//                 relations: ['organization'],
//             });
//         });

//         it('returns the updated strategyId', async () => {
//             const strategyId = faker.string.uuid();

//             const organization: Organization = {
//                 id: faker.string.uuid(),
//                 organizationName: faker.company.name(),
//                 parentOrganizationId: null,
//                 reportDay: ReportDay.FRIDAY,
//                 createdAt: new Date(),
//                 updatedAt: new Date(),
//                 goal: {} as any,
//                 users: {} as any,
//                 posts: {} as any,
//                 policies: {} as any,
//                 projects: {} as any,
//                 strategies: {} as any,
//                 account: {} as any,
//             };

//             const updateStrategyDto: StrategyUpdateDto = {
//                 _id: strategyId,
//                 state: State.ACTIVE,
//                 content: faker.commerce.product(),
//             }

//             const existingStrategy: StrategyReadDto = {
//                 id: strategyId,
//                 strategyNumber: faker.number.int(),
//                 dateActive: null,
//                 content: faker.finance.accountName(),
//                 state: State.DRAFT,
//                 createdAt: new Date(),
//                 updatedAt: new Date(),
//                 user: {} as any,
//                 account: {} as any,
//                 organization: organization,
//                 objective: {} as any,
//                 projects: {} as any,
//             };

//             const strategyRepositoryFindOneMock = jest.spyOn(strategyRepository, 'findOne').mockImplementation(({ where }) => {
//                 const whereObj = where as FindOptionsWhere<Strategy>; // Приводим к объекту
              
//                 if (
//                   typeof whereObj.organization === 'object' && 
//                   'id' in whereObj.organization &&
//                   whereObj.organization.id === organization.id
//                 ) {
//                   return Promise.resolve(null); // Стратегия со статусом ACTIVE не найдена
//                 }
              
//                 if (whereObj.id === strategyId) {
//                   return Promise.resolve(existingStrategy); // Возвращаем стратегию по ID
//                 }
              
//                 return Promise.resolve(null); // По умолчанию
//               });
//             const strategyRepositoryUpdateSpy = jest
//                 .spyOn(strategyRepository, 'update')
//                 .mockResolvedValue({
//                     generatedMaps: [],
//                     raw: [],
//                     affected: 1
//                 });

//             const result = await strategyService.update(strategyId, updateStrategyDto);
//             expect(result).toMatch(existingStrategy.id);
//             expect(strategyRepositoryFindOneMock).toHaveBeenCalledWith({
//                 where: { id: strategyId },
//                 relations: ['organization'],
//             });
//             expect(strategyRepositoryFindOneMock).toHaveBeenCalledWith({
//                 where: {
//                     state: State.ACTIVE,
//                     organization: { id: organization.id },
//                 },
//             });
//             expect(strategyRepositoryUpdateSpy).toHaveBeenCalledWith(
//                 strategyId,
//                 expect.objectContaining({
//                     state: updateStrategyDto.state,
//                     content: updateStrategyDto.content,
//                 }));
//         });
//     });
// });
