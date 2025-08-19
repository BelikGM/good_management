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
// import { StatisticDataService } from 'src/application/services/statisticData/statisticData.service';
// import { StatisticDataRepository } from 'src/application/services/statisticData/repository/statisticData.repository';
// import { StatisticData } from 'src/domains/statisticData.entity';
// import { StatisticDataCreateDto } from 'src/contracts/statisticData/create-statisticData.dto';
// import { StatisticDataUpdateDto } from 'src/contracts/statisticData/update-statisticData.dto';
// import { StatisticDataReadDto } from 'src/contracts/statisticData/read-statisticData.dto';

// describe('GoalService', () => {
//   let statisticDataService: StatisticDataService;
//   let statisticDataRepository: StatisticDataRepository;
//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       imports: [WinstonModule.forRoot(winstonConfig)],
//       providers: [
//         StatisticDataService,
//         {
//           provide: getRepositoryToken(StatisticData),
//           useClass: RepositoryFake,
//         },
//       ],
//     }).compile();
//     statisticDataService = module.get(StatisticDataService);
//     statisticDataRepository = module.get(getRepositoryToken(StatisticData));
//   });



// describe('creating a statisticData', () => {

//     it('calls the repository with correct paramaters', async () => {

//         const existingStatistic: StatisticReadDto = {
//             id: faker.string.uuid(),
//             type: Type.DIRECT,
//             name: faker.finance.currencyName(),
//             description: faker.finance.transactionDescription(),
//             createdAt: new Date(),
//             updatedAt: new Date(),
//             statisticDatas: {} as any,
//             post: {} as any,
//             account: {} as any,
//         };
        

//         const value = faker.number.int();
//         const valueDate = faker.date.anytime();
//         const isCorrelation = false;


        
//         const savedStatisticData: StatisticData = {
//             id: faker.string.uuid(),
//             value: value,
//             valueDate: valueDate,
//             isCorrelation: isCorrelation,
//             createdAt: new Date(),
//             updatedAt: new Date(),
//             statistic: existingStatistic,
//         };

//         const statisticDataCreateDto: StatisticDataCreateDto = {
//             value: value,
//             valueDate: valueDate,
//             isCorrelation: isCorrelation,
//             statistic: existingStatistic,
//         }


//         const statisticDataRepositoryInsertSpy = jest
//             .spyOn(statisticDataRepository, 'insert')
//             .mockResolvedValue({
//                 identifiers: [{ id: savedStatisticData.id }],
//                 generatedMaps: [],
//                 raw: [],
//             });

//         const result = await statisticDataService.create(statisticDataCreateDto);

//         expect(statisticDataRepositoryInsertSpy).toHaveBeenCalledWith(
//             expect.objectContaining({
//                 value: statisticDataCreateDto.value,
//                 valueDate: statisticDataCreateDto.valueDate,
//                 isCorrelation: statisticDataCreateDto.isCorrelation,
//                 statistic: statisticDataCreateDto.statistic,
//             }),);
//         expect(result).toMatch(savedStatisticData.id);
//     });
// });


// describe('updating a statisticData', () => {
//     it('throws an error when a statisticData doesnt exist', async () => {

//         const statisticDataId = faker.string.uuid()
//         const updateStatisticDataDto: StatisticDataUpdateDto = {
//             _id: statisticDataId,
//             value: faker.number.int(),
//             valueDate: faker.date.anytime(),
//             isCorrelation: false,
//         }

//         const statisticRepositoryFindOneSpy = jest
//             .spyOn(statisticDataRepository, 'findOne')
//             .mockResolvedValue(null);

//         expect.assertions(3);

//         try {
//             await statisticDataService.update(updateStatisticDataDto);
//         } catch (e) {
//             expect(e).toBeInstanceOf(NotFoundException);
//             expect(e.message).toBe(`Данные с ID ${statisticDataId} не найдены`);
//         }
//         expect(statisticRepositoryFindOneSpy).toHaveBeenCalledWith({
//             where: { id: statisticDataId }
//         });
//     });

//     it('returns the updated statisticDataId', async () => {
//         const statisticDataId = faker.string.uuid();
//         const value = faker.number.int();
//         const valueDate = faker.date.anytime();
//         const isCorrelation = false;

//         const updateStatisticDataDto: StatisticDataUpdateDto = {
//             _id: statisticDataId,
//             value: value,
//             valueDate: valueDate,
//             isCorrelation: isCorrelation,
//         }

//         const existingStatisticData: StatisticData = {
//             id: statisticDataId,
//             value: faker.number.int(),
//             valueDate: faker.date.anytime(),
//             isCorrelation: true,
//             createdAt: new Date(),
//             updatedAt: new Date(),
//             statistic: {} as any
//         };

//         const statisticDataRepositoryFindOneSpy = jest
//             .spyOn(statisticDataRepository, 'findOne')
//             .mockResolvedValue(existingStatisticData);

//         const statisticDataRepositoryUpdateSpy = jest
//             .spyOn(statisticDataRepository, 'update')
//             .mockResolvedValue({
//                 generatedMaps: [],
//                 raw: [],
//                 affected: 1
//             });

//         const result = await statisticDataService.update(updateStatisticDataDto);
//         expect(result).toMatch(existingStatisticData.id);
//         expect(statisticDataRepositoryFindOneSpy).toHaveBeenCalledWith({
//             where: { id: statisticDataId }
//         });
//         expect(statisticDataRepositoryUpdateSpy).toHaveBeenCalledWith(
//             statisticDataId,
//             expect.objectContaining({            
//                 value: updateStatisticDataDto.value,
//                 valueDate: updateStatisticDataDto.valueDate,
//                 isCorrelation: updateStatisticDataDto.isCorrelation,
//             }));
//     });
// });
// });
