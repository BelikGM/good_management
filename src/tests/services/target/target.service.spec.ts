// import { Test, TestingModule } from '@nestjs/testing';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { WinstonModule } from 'nest-winston';
// import { winstonConfig } from 'src/utils/winston-logger';
// import { RepositoryFake } from '../FakeClasses/repositoryFake';
// import { BadRequestException, NotFoundException } from '@nestjs/common';
// import { faker } from '@faker-js/faker/.';
// import { Target, Type, State } from 'src/domains/target.entity';
// import { TargetService } from 'src/application/services/target/target.service';
// import { TargetRepository } from 'src/application/services/target/repository/target.repository';
// import { TargetReadDto } from 'src/contracts/target/read-target.dto';
// import { Project, Type as ProjectType } from 'src/domains/project.entity';
// import { TargetCreateDto } from 'src/contracts/target/create-target.dto';
// import { TargetUpdateDto } from 'src/contracts/target/update-target.dto';
// import { TargetHolderService } from 'src/application/services/targetHolder/targetHolder.service';
// import { TargetHolder } from 'src/domains/targetHolder.entity';
// import { TargetHolderRepository } from 'src/application/services/targetHolder/repository/targetHolder.repository';

// describe('GoalService', () => {
//     let targetService: TargetService;
//     let targetRepository: TargetRepository;
//     let targetHolderService: TargetHolderService;
//     let targetHolderRepository: TargetHolderRepository;
//     beforeEach(async () => {
//         const module: TestingModule = await Test.createTestingModule({
//             imports: [WinstonModule.forRoot(winstonConfig)],
//             providers: [
//                 TargetService,
//                 TargetHolderService, // Реальный сервис
//                 {
//                     provide: getRepositoryToken(Target),
//                     useClass: RepositoryFake,
//                 },
//                 {
//                     provide: getRepositoryToken(TargetHolder),
//                     useClass: RepositoryFake, // Если TargetHolderService зависит от репозитория TargetHolder
//                 },
//             ],
//         }).compile();
//         targetService = module.get(TargetService);
//         targetRepository = module.get(getRepositoryToken(Target));
//         targetHolderService = module.get(TargetHolderService);
//         targetHolderRepository = module.get(getRepositoryToken(TargetHolder));
//     });


//     describe('finding all targets', () => {


//         it('returns all targets', async () => {


//             const existingTargets: TargetReadDto[] = [
//                 {
//                     id: faker.string.uuid(),
//                     type: Type.COMMON,
//                     orderNumber: faker.number.int(),
//                     content: faker.finance.transactionDescription(),
//                     holderUserId: faker.string.uuid(),
//                     targetState: State.ACTIVE,
//                     dateStart: faker.date.anytime(),
//                     deadline: faker.date.anytime(),
//                     dateComplete: null,
//                     createdAt: faker.date.anytime(),
//                     updatedAt: faker.date.anytime(),
//                     targetHolders: {} as any,
//                     project: {} as any,
//                 },
//                 {
//                     id: faker.string.uuid(),
//                     type: Type.COMMON,
//                     orderNumber: faker.number.int(),
//                     content: faker.finance.transactionDescription(),
//                     holderUserId: faker.string.uuid(),
//                     targetState: State.ACTIVE,
//                     dateStart: faker.date.anytime(),
//                     deadline: faker.date.anytime(),
//                     dateComplete: null,
//                     createdAt: faker.date.anytime(),
//                     updatedAt: faker.date.anytime(),
//                     targetHolders: {} as any,
//                     project: {} as any,
//                 },
//                 {
//                     id: faker.string.uuid(),
//                     type: Type.COMMON,
//                     orderNumber: faker.number.int(),
//                     content: faker.finance.transactionDescription(),
//                     holderUserId: faker.string.uuid(),
//                     targetState: State.ACTIVE,
//                     dateStart: faker.date.anytime(),
//                     deadline: faker.date.anytime(),
//                     dateComplete: null,
//                     createdAt: faker.date.anytime(),
//                     updatedAt: faker.date.anytime(),
//                     targetHolders: {} as any,
//                     project: {} as any,
//                 }
//             ]


//             const targetRepositoryFindAllSpy = jest
//                 .spyOn(targetRepository, 'find')
//                 .mockResolvedValue(existingTargets);

//             const result = await targetService.findAll();
//             expect(result).toMatchObject(existingTargets);
//             expect(targetRepositoryFindAllSpy).toHaveBeenCalled()
//         });
//     })


//     describe('creating a target', () => {

//         it('calls the repository with correct paramaters', async () => {

//             const project: Project = {
//                 id: faker.string.uuid(),
//                 projectNumber: faker.number.int(),
//                 projectName: faker.book.title(),
//                 programId: faker.string.uuid(),
//                 content: faker.string.sample(),
//                 type: ProjectType.PROJECT,
//                 createdAt: new Date(),
//                 updatedAt: new Date(),
//                 organization: {} as any,
//                 targets: {} as any,
//                 strategy: {} as any,
//                 account: {} as any,
//                 user: {} as any,
//             }


//             const type = Type.COMMON;
//             const orderNumber = faker.number.int();
//             const content = faker.finance.transactionDescription();
//             const holderUserId = faker.string.uuid();
//             const targetState = State.ACTIVE;
//             const dateStart = new Date('2024-11-29T12:48:06.239Z');
//             const deadline = new Date('2025-11-29T12:45:06.239Z');

//             const savedTarget: Target = {
//                 id: faker.string.uuid(),
//                 type: type,
//                 orderNumber: orderNumber,
//                 content: content,
//                 holderUserId: holderUserId,
//                 targetState: targetState,
//                 dateStart: dateStart,
//                 deadline: deadline,
//                 dateComplete: null,
//                 createdAt: faker.date.anytime(),
//                 updatedAt: faker.date.anytime(),
//                 targetHolders: {} as any,
//                 project: project,
//             };

//             const targetCreateDto: TargetCreateDto = {
//                 type: type,
//                 orderNumber: orderNumber,
//                 content: content,
//                 holderUserId: holderUserId,
//                 deadline: deadline,
//                 project: project,
//                 holderUser: {} as any
//             }

//             const targetRepositoryFindOneSpy = jest
//                 .spyOn(targetRepository, 'findOne')
//                 .mockResolvedValue(savedTarget);

//             const targetRepositoryInsertSpy = jest
//                 .spyOn(targetRepository, 'insert')
//                 .mockResolvedValue({
//                     identifiers: [{ id: savedTarget.id }],
//                     generatedMaps: [],
//                     raw: [],
//                 });

//             const result = await targetService.create(targetCreateDto);
//             expect(targetRepositoryInsertSpy).toHaveBeenCalledWith(
//                 expect.objectContaining({
//                     type: type,
//                     orderNumber: orderNumber,
//                     content: content,
//                     deadline: deadline,
//                     project: project,
//                     holderUserId: holderUserId
//                 }));

//             expect(targetRepositoryFindOneSpy).toHaveBeenCalledWith({
//                 where: { id: savedTarget.id }
//             });
//             expect(result).toEqual(savedTarget);
//         });
//     });


//     describe('updating a target', () => {
//         it('throws an error when a target doesnt exist', async () => {

//             const targetId = faker.string.uuid()
//             const updateTargetDto: TargetUpdateDto = {
//                 _id: targetId,
//                 content: faker.finance.transactionDescription(),
//                 orderNumber: faker.number.int(),
//                 holderUserId: faker.string.uuid(),
//                 targetState: State.ACTIVE,
//                 type: Type.COMMON,
//                 dateStart: faker.date.anytime(),
//                 deadline: faker.date.anytime(),
//                 holderUser: {} as any
//             }

//             const targetRepositoryFindOneSpy = jest
//                 .spyOn(targetRepository, 'findOne')
//                 .mockResolvedValue(null);

//             expect.assertions(3);

//             try {
//                 await targetService.update(updateTargetDto);
//             } catch (e) {
//                 expect(e).toBeInstanceOf(NotFoundException);
//                 expect(e.message).toBe(`Задача с ID ${targetId} не найдена`);
//             }
//             expect(targetRepositoryFindOneSpy).toHaveBeenCalledWith({
//                 where: { id: targetId },
//             });
//         });

//         it('returns the updated targetId', async () => {
//             const targetId = faker.string.uuid();


//             const updateTargetDto: TargetUpdateDto = {
//                 _id: targetId,
//                 content: faker.finance.transactionDescription(),
//                 orderNumber: faker.number.int(),
//                 holderUserId: faker.string.uuid(),
//                 targetState: State.ACTIVE,
//                 type: Type.COMMON,
//                 dateStart: faker.date.anytime(),
//                 deadline: faker.date.anytime(),
//                 holderUser: {} as any
//             }

//             const existingTarget: TargetReadDto = {
//                 id: targetId,
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
//             };

//             const targetRepositoryFindOneMock = jest.spyOn(targetRepository, 'findOne').mockResolvedValue(existingTarget)
//             const targetRepositoryUpdateSpy = jest
//                 .spyOn(targetRepository, 'update')
//                 .mockResolvedValue({
//                     generatedMaps: [],
//                     raw: [],
//                     affected: 1
//                 });

//             const result = await targetService.update(updateTargetDto);
//             expect(result).toMatch(existingTarget.id);
//             expect(targetRepositoryFindOneMock).toHaveBeenCalledWith({
//                 where: { id: targetId },
//             });
//             expect(targetRepositoryUpdateSpy).toHaveBeenCalledWith(
//                 targetId,
//                 expect.objectContaining({
//                     content: updateTargetDto.content,
//                     holderUserId: updateTargetDto.holderUserId,
//                     targetState: updateTargetDto.targetState,
//                     dateStart: updateTargetDto.dateStart,
//                     deadline: updateTargetDto.deadline,
//                 }));
//         });
//     });
// });
