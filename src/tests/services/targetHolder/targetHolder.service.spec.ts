// import { Test, TestingModule } from '@nestjs/testing';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { WinstonModule } from 'nest-winston';
// import { winstonConfig } from 'src/utils/winston-logger';
// import { RepositoryFake } from '../FakeClasses/repositoryFake';
// import { faker } from '@faker-js/faker/.';
// import { Target, Type, State } from 'src/domains/target.entity';
// import { TargetHolderService } from 'src/application/services/targetHolder/targetHolder.service';
// import { TargetHolder } from 'src/domains/targetHolder.entity';
// import { TargetHolderRepository } from 'src/application/services/targetHolder/repository/targetHolder.repository';
// import { TargetHolderReadDto } from 'src/contracts/targetHolder/read-targetHolder.dto';
// import { User } from 'src/domains/user.entity';
// import { TargetHolderCreateDto } from 'src/contracts/targetHolder/create-targetHolder.dto';

// describe('GoalService', () => {
//     let targetHolderService: TargetHolderService;
//     let targetHolderRepository: TargetHolderRepository;
//     beforeEach(async () => {
//         const module: TestingModule = await Test.createTestingModule({
//             imports: [WinstonModule.forRoot(winstonConfig)],
//             providers: [
//                 TargetHolderService, // Реальный сервис
//                 {
//                     provide: getRepositoryToken(TargetHolder),
//                     useClass: RepositoryFake, // Если TargetHolderService зависит от репозитория TargetHolder
//                 },
//             ],
//         }).compile();
//         targetHolderService = module.get(TargetHolderService);
//         targetHolderRepository = module.get(getRepositoryToken(TargetHolder));
//     });


//     describe('finding all targetHolders', () => {


//         it('returns all targetHolders', async () => {


//             const existingTargetHolders: TargetHolderReadDto[] = [
//                 {
//                     id: faker.string.uuid(),
//                     target: {} as any,
//                     user: {} as any,
//                 },
//                 {
//                     id: faker.string.uuid(),
//                     target: {} as any,
//                     user: {} as any,
//                 },
//                 {
//                     id: faker.string.uuid(),
//                     target: {} as any,
//                     user: {} as any,
//                 }
//             ]


//             const targetHolderRepositoryFindAllSpy = jest
//                 .spyOn(targetHolderRepository, 'find')
//                 .mockResolvedValue(existingTargetHolders as TargetHolder[]);

//             const result = await targetHolderService.findAll();
//             expect(result).toMatchObject(existingTargetHolders);
//             expect(targetHolderRepositoryFindAllSpy).toHaveBeenCalledWith({
//                 relations: ['user', 'target'],
//             })
//         });
//     })


//     describe('creating a targetHolder', () => {

//         it('calls the repository with correct paramaters', async () => {

//             const target: Target = {
//                 id: faker.string.uuid(),
//                 type: Type.COMMON,
//                 orderNumber: faker.number.int(),
//                 content: faker.finance.transactionDescription(),
//                 holderUserId: faker.string.uuid(),
//                 targetState: State.ACTIVE,
//                 dateStart: faker.date.anytime(),
//                 deadline: faker.date.anytime(),
//                 dateComplete: null,
//                 createdAt: faker.date.anytime(),
//                 updatedAt: faker.date.anytime(),
//                 targetHolders: {} as any,
//                 project: {} as any,
//             }

//             const user: User = {
//                 id: faker.string.uuid(),
//                 firstName: faker.person.firstName(),
//                 lastName: faker.person.lastName(),
//                 middleName: faker.person.middleName(),
//                 telegramId: faker.number.int(),
//                 telephoneNumber: faker.phone.number(),
//                 avatar_url: faker.internet.url(),
//                 vk_id: faker.number.int(),
//                 createdAt: new Date(),
//                 updatedAt: new Date(),
//                 posts: {} as any,
//                 refreshSessions: {} as any,
//                 goals: {} as any,
//                 policies: {} as any,
//                 strategies: {} as any,
//                 targetHolders: {} as any,
//                 projects: {} as any,
//                 organization: {} as any,
//                 account: {} as any,
//                 role: {} as any,
//                 convert: {} as any,
//                 convertToUsers: {} as any,
//                 messages: {} as any,
//                 groupToUsers: {} as any,
//                 historiesUsersToPost: {} as any,
//             }



//             const savedTargetHolder: TargetHolder = {
//                 id: faker.string.uuid(),
//                 createdAt: new Date(),
//                 updatedAt: new Date(),
//                 user: user,
//                 target: target
//             };

//             const targetHolderCreateDto: TargetHolderCreateDto = {
//                 user: user,
//                 target: target
//             }
//             const targetHolderRepositoryInsertSpy = jest
//                 .spyOn(targetHolderRepository, 'insert')
//                 .mockResolvedValue({
//                     identifiers: [{ id: savedTargetHolder.id }],
//                     generatedMaps: [],
//                     raw: [],
//                 });

//             const result = await targetHolderService.create(targetHolderCreateDto);
//             expect(targetHolderRepositoryInsertSpy).toHaveBeenCalledWith(targetHolderCreateDto);
//             expect(result).toEqual(savedTargetHolder.id);
//         });
//     });

// });
