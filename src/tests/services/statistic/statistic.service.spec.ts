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

// describe('GoalService', () => {
//   let statisticService: StatisticService;
//   let statisticRepository: StatisticRepository;
//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       imports: [WinstonModule.forRoot(winstonConfig)],
//       providers: [
//         StatisticService,
//         {
//           provide: getRepositoryToken(Statistic),
//           useClass: RepositoryFake,
//         },
//       ],
//     }).compile();
//     statisticService = module.get(StatisticService);
//     statisticRepository = module.get(getRepositoryToken(Statistic));
//   });


//   describe('finding all statistics', () => {


//     it('returns all statistics for account', async () => {

//         const account: Account = {
//             id: faker.string.uuid(),
//             accountName: faker.company.name(),
//             tenantId: faker.string.uuid(),
//             createdAt: new Date(),
//             updatedAt: new Date(),
//             users: null,
//             organizations: null,
//             goals: null,
//             objectives: null,
//             policies: null,
//             projects: null,
//             strategies: null,
//             posts: null,
//             statistics: null,
//             roleSettings: null,
//             policyDirectories: null,
//             converts: null,
//             groups: null,
//         };

//         const existingStatistics: StatisticReadDto[] = [
//             {
//                 id: faker.string.uuid(),
//                 type: Type.DIRECT,
//                 name: faker.person.jobType(),
//                 description: faker.company.name(),
//                 createdAt: new Date(),
//                 updatedAt: new Date(),
//                 statisticDatas: {} as any,
//                 post: {} as any,
//                 account: account,
//             },
//             {
//                 id: faker.string.uuid(),
//                 type: Type.DIRECT,
//                 name: faker.person.jobType(),
//                 description: faker.company.name(),
//                 createdAt: new Date(),
//                 updatedAt: new Date(),
//                 statisticDatas: {} as any,
//                 post: {} as any,
//                 account: account,
//             },
//             {
//                 id: faker.string.uuid(),
//                 type: Type.DIRECT,
//                 name: faker.person.jobType(),
//                 description: faker.company.name(),
//                 createdAt: new Date(),
//                 updatedAt: new Date(),
//                 statisticDatas: {} as any,
//                 post: {} as any,
//                 account: {} as any,
//             }
//         ]


//         const statisticRepositoryFindAllSpy = jest
//             .spyOn(statisticRepository, 'find')
//             .mockResolvedValue(existingStatistics);

//         const result = await statisticService.findAllForAccount(account);
//         expect(result).toMatchObject(existingStatistics);
//         expect(statisticRepositoryFindAllSpy).toHaveBeenCalledWith({
//             where: { account: { id: account.id } },
//             relations: []
//         });
//     });

// });

// describe('finding a statistic', () => {
//     it('throws an error when a statistic doesnt exist', async () => {
//         const statisticId = faker.string.uuid();

//         const statisticRepositoryFindOneSpy = jest
//             .spyOn(statisticRepository, 'findOne')
//             .mockResolvedValue(null);

//         expect.assertions(3);

//         try {
//             await statisticService.findOneById(statisticId);
//         } catch (e) {
//             expect(e).toBeInstanceOf(NotFoundException);
//             expect(e.message).toBe(`Статистика с ID: ${statisticId} не найдена`);
//         }

//         expect(statisticRepositoryFindOneSpy).toHaveBeenCalledWith({
//             where: { id: statisticId },
//             relations: [],
//         });
//     });

//     it('returns the found statistic', async () => {
//         const statisticId = faker.string.uuid();

//         const existingStatistic: StatisticReadDto = {
//             id: statisticId,
//             type: Type.DIRECT,
//             name: faker.person.jobType(),
//             description: faker.company.name(),
//             createdAt: new Date(),
//             updatedAt: new Date(),
//             statisticDatas: {} as any,
//             post: {} as any,
//             account: {} as any,
//         }

//         const statisticRepositoryFindOneSpy = jest
//             .spyOn(statisticRepository, 'findOne')
//             .mockResolvedValue(existingStatistic);

//         const result = await statisticService.findOneById(statisticId);
//         expect(result).toMatchObject(existingStatistic);
//         expect(statisticRepositoryFindOneSpy).toHaveBeenCalledWith({
//             where: { id: statisticId },
//             relations: [],
//         });
//     });

// });

// describe('creating a statistic', () => {

//     it('calls the repository with correct paramaters', async () => {

//         const account: Account = {
//             id: faker.string.uuid(),
//             accountName: faker.company.name(),
//             tenantId: faker.string.uuid(),
//             createdAt: new Date(),
//             updatedAt: new Date(),
//             users: null,
//             organizations: null,
//             goals: null,
//             objectives: null,
//             policies: null,
//             projects: null,
//             strategies: null,
//             posts: null,
//             statistics: null,
//             roleSettings: null,
//             policyDirectories: null,
//             converts: null,
//             groups: null,
//         };

//         const post: PostReadDto = 
//             {
//                 id: faker.string.uuid(),
//                 postName: faker.person.jobType(),
//                 divisionName: faker.person.jobDescriptor(),
//                 divisionNumber: faker.number.int(),
//                 parentId: faker.string.uuid(),
//                 product: faker.commerce.product(),
//                 purpose: faker.commerce.productDescription(),
//                 createdAt: new Date(),
//                 updatedAt: new Date(),
//                 user: {} as any,
//                 policy: {} as any,
//                 statistics: {} as any,
//                 organization: {} as any,
//                 account: account,
//                 historiesUsersToPost: {} as any
//             };

//         const type = Type.DIRECT;
//         const name = faker.commerce.department();
//         const description = faker.person.jobType();


        
//         const savedStatistic: Statistic = {
//             id: faker.string.uuid(),
//             type: type,
//             name: name,
//             description: description,
//             createdAt: new Date(),
//             updatedAt: new Date(),
//             statisticDatas: {} as any,
//             post: post,
//             account: account,
//         };

//         const statisticCreateDto: StatisticCreateDto = {
//             type: type,
//             name: name,
//             description: description,
//             postId: post.id,
//             post: post,
//             account: account,
//         }


//         const statisticRepositorySaveSpy = jest
//             .spyOn(statisticRepository, 'save')
//             .mockResolvedValue(savedStatistic);

//         const result = await statisticService.create(statisticCreateDto);

//         expect(statisticRepositorySaveSpy).toHaveBeenCalledWith(
//             expect.objectContaining({
//                 type: statisticCreateDto.type,
//                 name: statisticCreateDto.name,
//                 description: statisticCreateDto.description,
//                 post: statisticCreateDto.post,
//                 account: statisticCreateDto.account,
//             }),);
//         expect(result).toMatchObject(savedStatistic);
//     });
// });


// describe('updating a statistic', () => {
//     it('throws an error when a statistic doesnt exist', async () => {

//         const statisticId = faker.string.uuid()
//         const updateStatisticDto: StatisticUpdateDto = {
//             _id: statisticId,
//             type: Type.DIRECT,
//             name: faker.finance.currencyName(),
//             description: faker.finance.transactionDescription(),
//             postId: faker.string.uuid(),
//             post: {} as any
//         }

//         const statisticRepositoryFindOneSpy = jest
//             .spyOn(statisticRepository, 'findOne')
//             .mockResolvedValue(null);

//         expect.assertions(3);

//         try {
//             await statisticService.update(statisticId, updateStatisticDto);
//         } catch (e) {
//             expect(e).toBeInstanceOf(NotFoundException);
//             expect(e.message).toBe(`Статистика с ID ${statisticId} не найдена`);
//         }
//         expect(statisticRepositoryFindOneSpy).toHaveBeenCalledWith({
//             where: { id: statisticId }
//         });
//     });

//     it('returns the updated statisticId', async () => {
//         const statisticId = faker.string.uuid();

//         const post: PostReadDto = 
//         {
//             id: faker.string.uuid(),
//             postName: faker.person.jobType(),
//             divisionName: faker.person.jobDescriptor(),
//             divisionNumber: faker.number.int(),
//             parentId: faker.string.uuid(),
//             product: faker.commerce.product(),
//             purpose: faker.commerce.productDescription(),
//             createdAt: new Date(),
//             updatedAt: new Date(),
//             user: {} as any,
//             policy: {} as any,
//             statistics: {} as any,
//             organization: {} as any,
//             account: {} as any,
//             historiesUsersToPost: {} as any
//         };

//         const updateStatisticDto: StatisticUpdateDto = {
//             _id: statisticId,
//             type: Type.DIRECT,
//             name: faker.finance.currencyName(),
//             description: faker.finance.transactionDescription(),
//             postId: faker.string.uuid(),
//             post: post
//         }

//         const existingStatistic: StatisticReadDto = {
//             id: statisticId,
//             type: Type.DIRECT,
//             name: faker.finance.currencyName(),
//             description: faker.finance.transactionDescription(),
//             createdAt: new Date(),
//             updatedAt: new Date(),
//             statisticDatas: {} as any,
//             post: post,
//             account: {} as any,
//         };

//         const statisticRepositoryFindOneSpy = jest
//             .spyOn(statisticRepository, 'findOne')
//             .mockResolvedValue(existingStatistic);

//         const statisticRepositoryUpdateSpy = jest
//             .spyOn(statisticRepository, 'update')
//             .mockResolvedValue({
//                 generatedMaps: [],
//                 raw: [],
//                 affected: 1
//             });

//         const result = await statisticService.update(statisticId, updateStatisticDto);
//         expect(result).toMatch(existingStatistic.id);
//         expect(statisticRepositoryFindOneSpy).toHaveBeenCalledWith({
//             where: { id: statisticId }
//         });
//         expect(statisticRepositoryUpdateSpy).toHaveBeenCalledWith(
//             statisticId,
//             expect.objectContaining({            
//                 type: updateStatisticDto.type,
//                 name: updateStatisticDto.name,
//                 description: updateStatisticDto.description,
//                 post: updateStatisticDto.post
//             }));
//     });
// });
// });
