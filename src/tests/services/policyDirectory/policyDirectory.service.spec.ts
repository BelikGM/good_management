// import { Test, TestingModule } from "@nestjs/testing";
// import { getRepositoryToken } from "@nestjs/typeorm";
// import { WinstonModule } from "nest-winston";
// import { winstonConfig } from "src/utils/winston-logger";
// import { RepositoryFake } from "../FakeClasses/repositoryFake";
// import { faker } from "@faker-js/faker/.";
// import { Account } from "src/domains/account.entity";
// import { NotFoundException } from "@nestjs/common";
// import { State, Policy, Type } from "src/domains/policy.entity";
// import { PolicyService } from "src/application/services/policy/policy.service";
// import { PolicyToPolicyDirectoryService } from "src/application/services/policyToPolicyDirectories/policyToPolicyDirectory.service";
// import { PolicyDirectoryRepository } from "src/application/services/policyDirectory/repository/policyDirectory.repository";
// import { PolicyDirectoryService } from "src/application/services/policyDirectory/policyDirectory.service";
// import { PolicyDirectory } from "src/domains/policyDirectory.entity";
// import { PolicyDirectoryReadDto } from "src/contracts/policyDirectory/read-policyDirectory.dto";
// import { PolicyDirectoryCreateDto } from "src/contracts/policyDirectory/create-policyDirectory.dto";
// import { PolicyToPolicyDirectory } from "src/domains/policyToPolicyDirectories.entity";
// import { PolicyToPolicyDirectoryRepository } from "src/application/services/policyToPolicyDirectories/repository/policyToPolicyDirectory.repository";
// import { PolicyRepository } from "src/application/services/policy/repository/policy.repository";
// import { PolicyDirectoryUpdateDto } from "src/contracts/policyDirectory/update-policyDirectory.dto";

// describe('PolicyDirectoryService', () => {
//     let policyRepository: PolicyRepository;
//     let policyDirectoryService: PolicyDirectoryService;
//     let policyDirectoryRepository: PolicyDirectoryRepository;
//     let policyToPolicyDirectoryService: PolicyToPolicyDirectoryService;
//     let policyToPolicyDirectoryRepository: PolicyToPolicyDirectoryRepository;
//     beforeEach(async () => {
//         const module: TestingModule = await Test.createTestingModule({
//             imports: [WinstonModule.forRoot(winstonConfig)],
//             providers: [
//                 PolicyDirectoryService,
//                 PolicyToPolicyDirectoryService,
//                 PolicyService,
//                 {
//                     provide: getRepositoryToken(PolicyDirectory),
//                     useClass: RepositoryFake
//                 },
//                 {
//                     provide: getRepositoryToken(PolicyToPolicyDirectory),
//                     useClass: RepositoryFake
//                 },
//                 {
//                     provide: getRepositoryToken(Policy),
//                     useClass: RepositoryFake
//                 },
//             ]
//         }).compile();
//         policyDirectoryService = module.get(PolicyDirectoryService);
//         policyDirectoryRepository = module.get(getRepositoryToken(PolicyDirectory));
//         policyToPolicyDirectoryService = module.get(PolicyToPolicyDirectoryService);
//         policyToPolicyDirectoryRepository = module.get(getRepositoryToken(PolicyToPolicyDirectory));
//         policyRepository = module.get(getRepositoryToken(Policy));
//     });

//     describe('find all policyDirectories', () => {
//         it('returns all policyDirectories', async () => {

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

//             const policyDirectories: PolicyDirectory[] = [
//                 {
//                     id: faker.string.uuid(),
//                     directoryName: faker.book.title(),
//                     createdAt: new Date(),
//                     updatedAt: new Date(),
//                     account: account,
//                     policyToPolicyDirectories: [
//                         {
//                             id: faker.string.uuid(),
//                             createdAt: new Date(),
//                             updatedAt: new Date(),
//                             policy: {
//                                 id: faker.string.uuid(),
//                                 policyName: faker.book.title(),
//                                 policyNumber: faker.number.int(),
//                                 state: State.ACTIVE,
//                                 type: Type.DIRECTIVE,
//                                 dateActive: faker.date.anytime(),
//                                 content: faker.book.genre(),
//                                 createdAt: new Date(),
//                                 updatedAt: new Date(),
//                                 posts: {} as any,
//                                 organization: {} as any,
//                                 user: {} as any,
//                                 account: account,
//                                 policyToPolicyDirectories: {} as any,
//                             },
//                             policyDirectory: {} as any
//                         },
//                         {
//                             id: faker.string.uuid(),
//                             createdAt: new Date(),
//                             updatedAt: new Date(),
//                             policy: {
//                                 id: faker.string.uuid(),
//                                 policyName: faker.book.title(),
//                                 policyNumber: faker.number.int(),
//                                 state: State.ACTIVE,
//                                 type: Type.DIRECTIVE,
//                                 dateActive: faker.date.anytime(),
//                                 content: faker.book.genre(),
//                                 createdAt: new Date(),
//                                 updatedAt: new Date(),
//                                 posts: {} as any,
//                                 organization: {} as any,
//                                 user: {} as any,
//                                 account: account,
//                                 policyToPolicyDirectories: {} as any,
//                             },
//                             policyDirectory: {} as any
//                         }
//                     ],
//                 }, {
//                     id: faker.string.uuid(),
//                     directoryName: faker.book.title(),
//                     createdAt: new Date(),
//                     updatedAt: new Date(),
//                     account: account,
//                     policyToPolicyDirectories: [
//                         {
//                             id: faker.string.uuid(),
//                             createdAt: new Date(),
//                             updatedAt: new Date(),
//                             policy: {
//                                 id: faker.string.uuid(),
//                                 policyName: faker.book.title(),
//                                 policyNumber: faker.number.int(),
//                                 state: State.ACTIVE,
//                                 type: Type.DIRECTIVE,
//                                 dateActive: faker.date.anytime(),
//                                 content: faker.book.genre(),
//                                 createdAt: new Date(),
//                                 updatedAt: new Date(),
//                                 posts: {} as any,
//                                 organization: {} as any,
//                                 user: {} as any,
//                                 account: account,
//                                 policyToPolicyDirectories: {} as any,
//                             },
//                             policyDirectory: {} as any
//                         },
//                         {
//                             id: faker.string.uuid(),
//                             createdAt: new Date(),
//                             updatedAt: new Date(),
//                             policy: {
//                                 id: faker.string.uuid(),
//                                 policyName: faker.book.title(),
//                                 policyNumber: faker.number.int(),
//                                 state: State.ACTIVE,
//                                 type: Type.DIRECTIVE,
//                                 dateActive: faker.date.anytime(),
//                                 content: faker.book.genre(),
//                                 createdAt: new Date(),
//                                 updatedAt: new Date(),
//                                 posts: {} as any,
//                                 organization: {} as any,
//                                 user: {} as any,
//                                 account: account,
//                                 policyToPolicyDirectories: {} as any,
//                             },
//                             policyDirectory: {} as any
//                         }
//                     ],
//                 }, {
//                     id: faker.string.uuid(),
//                     directoryName: faker.book.title(),
//                     createdAt: new Date(),
//                     updatedAt: new Date(),
//                     account: account,
//                     policyToPolicyDirectories: [
//                         {
//                             id: faker.string.uuid(),
//                             createdAt: new Date(),
//                             updatedAt: new Date(),
//                             policy: {
//                                 id: faker.string.uuid(),
//                                 policyName: faker.book.title(),
//                                 policyNumber: faker.number.int(),
//                                 state: State.ACTIVE,
//                                 type: Type.DIRECTIVE,
//                                 dateActive: faker.date.anytime(),
//                                 content: faker.book.genre(),
//                                 createdAt: new Date(),
//                                 updatedAt: new Date(),
//                                 posts: {} as any,
//                                 organization: {} as any,
//                                 user: {} as any,
//                                 account: account,
//                                 policyToPolicyDirectories: {} as any,
//                             },
//                             policyDirectory: {} as any
//                         },
//                         {
//                             id: faker.string.uuid(),
//                             createdAt: new Date(),
//                             updatedAt: new Date(),
//                             policy: {
//                                 id: faker.string.uuid(),
//                                 policyName: faker.book.title(),
//                                 policyNumber: faker.number.int(),
//                                 state: State.ACTIVE,
//                                 type: Type.DIRECTIVE,
//                                 dateActive: faker.date.anytime(),
//                                 content: faker.book.genre(),
//                                 createdAt: new Date(),
//                                 updatedAt: new Date(),
//                                 posts: {} as any,
//                                 organization: {} as any,
//                                 user: {} as any,
//                                 account: account,
//                                 policyToPolicyDirectories: {} as any,
//                             },
//                             policyDirectory: {} as any
//                         }
//                     ],
//                 },
//             ]

//             const policyDirectoryRepositoryFindAllSpy = jest.spyOn(policyDirectoryRepository, 'find').mockResolvedValue(policyDirectories);

//             const result = await policyDirectoryService.findAllForAccount(account);
//             console.log(result)
//             expect(result).toEqual(policyDirectories.map((policyDirectory) => ({
//                 id: policyDirectory.id,
//                 directoryName: policyDirectory.directoryName,
//                 policyToPolicyDirectories: policyDirectory.policyToPolicyDirectories.filter((policyToPolicyDirectory) => policyToPolicyDirectory.policy.state === State.ACTIVE),
//             })));
//             expect(policyDirectoryRepositoryFindAllSpy).toHaveBeenCalledWith({
//                 where: { account: { id: account.id } },
//                 relations: []
//             });
//         });
//     });

//     describe('finding one policyDirectory', () => {
//         it('throws an error when a policyDirectory doesnt exist', async () => {
//             const policyDirectoryId = faker.string.uuid();

//             const policyDirectoryRepositoryFindOneSpy = jest
//                 .spyOn(policyDirectoryRepository, 'findOne')
//                 .mockResolvedValue(null);

//             expect.assertions(3);

//             try {
//                 await policyDirectoryService.findOneById(policyDirectoryId, ['policyToPolicyDirectories.policy']);
//             } catch (e) {
//                 expect(e).toBeInstanceOf(NotFoundException);
//                 expect(e.message).toBe(`Папка с ID: ${policyDirectoryId} не найдена`);
//             }

//             expect(policyDirectoryRepositoryFindOneSpy).toHaveBeenCalledWith({
//                 where: { id: policyDirectoryId },
//                 relations: ['policyToPolicyDirectories.policy'],
//             });
//         });

//         it('returns the found policyDirectory', async () => {
//             const policyDirectoryId = faker.string.uuid();

//             const existingPolicyDirectory: PolicyDirectoryReadDto = {
//                 id: policyDirectoryId,
//                 directoryName: faker.book.title(),
//                 policyToPolicyDirectories: [
//                     {
//                         id: faker.string.uuid(),
//                         createdAt: new Date(),
//                         updatedAt: new Date(),
//                         policy: {
//                             id: faker.string.uuid(),
//                             policyName: faker.book.title(),
//                             policyNumber: faker.number.int(),
//                             state: State.ACTIVE,
//                             type: Type.DIRECTIVE,
//                             dateActive: faker.date.anytime(),
//                             content: faker.book.genre(),
//                             createdAt: new Date(),
//                             updatedAt: new Date(),
//                             posts: {} as any,
//                             organization: {} as any,
//                             user: {} as any,
//                             account: {} as any,
//                             policyToPolicyDirectories: {} as any,
//                         },
//                         policyDirectory: {} as any
//                     },
//                     {
//                         id: faker.string.uuid(),
//                         createdAt: new Date(),
//                         updatedAt: new Date(),
//                         policy: {
//                             id: faker.string.uuid(),
//                             policyName: faker.book.title(),
//                             policyNumber: faker.number.int(),
//                             state: State.ACTIVE,
//                             type: Type.DIRECTIVE,
//                             dateActive: faker.date.anytime(),
//                             content: faker.book.genre(),
//                             createdAt: new Date(),
//                             updatedAt: new Date(),
//                             posts: {} as any,
//                             organization: {} as any,
//                             user: {} as any,
//                             account: {} as any,
//                             policyToPolicyDirectories: {} as any,
//                         },
//                         policyDirectory: {} as any
//                     }
//                 ],
//             }

//             const policyDirectoryRepositoryFindOneSpy = jest
//                 .spyOn(policyDirectoryRepository, 'findOne')
//                 .mockResolvedValue(existingPolicyDirectory as PolicyDirectory);

//             const result = await policyDirectoryService.findOneById(policyDirectoryId, ['policyToPolicyDirectories.policy']);
//             expect(result).toMatchObject(existingPolicyDirectory);
//             expect(policyDirectoryRepositoryFindOneSpy).toHaveBeenCalledWith({
//                 where: { id: policyDirectoryId },
//                 relations: ['policyToPolicyDirectories.policy'],
//             });
//         });
//     });

//     describe('creating a policyDirectory', () => {
//         it('calls the repository with correct paramaters', async () => {

//             const policyDirectoryId = faker.string.uuid();
//             const directoryName = faker.book.title();
//             const policyToPolicyDirectoriesIds = faker.helpers.multiple(() => faker.string.uuid(), {
//                 count: 1,
//             });

//             const policy: Policy = {
//                 id: policyToPolicyDirectoriesIds[0],
//                 policyName: faker.book.title(),
//                 policyNumber: faker.number.int(),
//                 state: State.ACTIVE,
//                 type: Type.DIRECTIVE,
//                 dateActive: faker.date.anytime(),
//                 content: faker.book.genre(),
//                 createdAt: new Date(),
//                 updatedAt: new Date(),
//                 posts: {} as any,
//                 organization: {} as any,
//                 user: {} as any,
//                 account: {} as any,
//                 policyToPolicyDirectories: {} as any,
//             };


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

//             const policyDirectoryCreateDto: PolicyDirectoryCreateDto = {
//                 directoryName: directoryName,
//                 policyToPolicyDirectories: policyToPolicyDirectoriesIds,
//                 account: account
//             }

//             const savedPolicyDirectory: PolicyDirectory = {
//                 id: policyDirectoryId,
//                 directoryName: directoryName,
//                 createdAt: new Date(),
//                 updatedAt: new Date(),
//                 policyToPolicyDirectories: [],
//                 account: account
//             }

//             const policyDirectoryRepositorySaveSpy = jest
//                 .spyOn(policyDirectoryRepository, 'save')
//                 .mockResolvedValue(savedPolicyDirectory);

//             const policyRepositorySaveSpy = jest
//                 .spyOn(policyRepository, 'findOne')
//                 .mockResolvedValue(policy);


//             const result = await policyDirectoryService.create(policyDirectoryCreateDto);

//             expect(policyDirectoryRepositorySaveSpy).toHaveBeenCalledWith(expect.objectContaining({
//                 directoryName: policyDirectoryCreateDto.directoryName,
//                 account: policyDirectoryCreateDto.account,
//             }));
//             expect(policyRepositorySaveSpy).toHaveBeenCalledWith({
//                 where: { id: policy.id },
//                 relations: []
//             });
//             expect(result).toEqual(savedPolicyDirectory);
//         });
//     });



//     describe('updating a policyDirectory', () => {

//         it('throws an error when a policyDirectory doesnt exist', async () => {

//             const policyDirectoryId = faker.string.uuid();


//             const updatePolicyDirectoryDto: PolicyDirectoryUpdateDto = {
//                 directoryName: faker.commerce.department(),
//                 policyToPolicyDirectories: faker.helpers.multiple(() => faker.string.uuid(), { count: 3 })
//             }

//             const policyDirectoryRepositoryFindOneSpy = jest
//                 .spyOn(policyDirectoryRepository, 'findOne')
//                 .mockResolvedValue(null);

//             expect.assertions(3);

//             try {
//                 await policyDirectoryService.update(policyDirectoryId, updatePolicyDirectoryDto);
//             } catch (e) {
//                 expect(e).toBeInstanceOf(NotFoundException);
//                 expect(e.message).toBe(`Папка с ID ${policyDirectoryId} не найдена`);
//             }
//             expect(policyDirectoryRepositoryFindOneSpy).toHaveBeenCalledWith({
//                 where: { id: policyDirectoryId }
//             });
//         });

//         it('calls the repository with correct paramaters', async () => {
//             const policyDirectoryId = faker.string.uuid();

//             const policyToPolicyDirectoriesIds = faker.helpers.multiple(() => faker.string.uuid(), {
//                 count: 1,
//             });

//             const policy: Policy = {
//                 id: policyToPolicyDirectoriesIds[0],
//                 policyName: faker.book.title(),
//                 policyNumber: faker.number.int(),
//                 state: State.ACTIVE,
//                 type: Type.DIRECTIVE,
//                 dateActive: faker.date.anytime(),
//                 content: faker.book.genre(),
//                 createdAt: new Date(),
//                 updatedAt: new Date(),
//                 posts: {} as any,
//                 organization: {} as any,
//                 user: {} as any,
//                 account: {} as any,
//                 policyToPolicyDirectories: {} as any,
//             };
//             const updatePolicyDirectoryDto: PolicyDirectoryUpdateDto = {
//                 directoryName: faker.commerce.department(),
//                 policyToPolicyDirectories: policyToPolicyDirectoriesIds
//             }
//             const policyDirectory: PolicyDirectory = {
//                 id: policyDirectoryId,
//                 directoryName: updatePolicyDirectoryDto.directoryName,
//                 createdAt: new Date(),
//                 updatedAt: new Date(),
//                 policyToPolicyDirectories: {} as any,
//                 account: {} as any
//             };

//             const policyDirectoryRepositoryFindOneSpy = jest
//                 .spyOn(policyDirectoryRepository, 'findOne')
//                 .mockResolvedValue(policyDirectory);

//             const policyDirectoryRepositorySaveSpy = jest
//                 .spyOn(policyDirectoryRepository, 'save')
//                 .mockResolvedValue(policyDirectory);

//             const policyToPolicyDirectoryRepositoryDeleteSpy = jest
//                 .spyOn(policyToPolicyDirectoryRepository, 'delete')
//                 .mockReturnThis();

//             const policyRepositorySaveSpy = jest
//                 .spyOn(policyRepository, 'findOne')
//                 .mockResolvedValue(policy);

//             const result = await policyDirectoryService.update(policyDirectoryId, updatePolicyDirectoryDto);


//             expect(result).toMatchObject(policyDirectory);
//             expect(policyDirectoryRepositoryFindOneSpy).toHaveBeenCalledWith({
//                 where: { id: policyDirectoryId },
//             });
//             expect(policyToPolicyDirectoryRepositoryDeleteSpy).toHaveBeenCalledWith({ policyDirectory: policyDirectory })
//             expect(policyRepositorySaveSpy).toHaveBeenCalledWith({
//                 where: { id: policy.id },
//                 relations: []
//             });
//             expect(policyDirectoryRepositorySaveSpy).toHaveBeenCalledWith(policyDirectory);
//         });
//     });
// });