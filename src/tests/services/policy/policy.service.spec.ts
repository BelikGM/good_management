// import { Test, TestingModule } from "@nestjs/testing";
// import { getRepositoryToken } from "@nestjs/typeorm";
// import { WinstonModule } from "nest-winston";
// import { winstonConfig } from "src/utils/winston-logger";
// import { RepositoryFake } from "../FakeClasses/repositoryFake";
// import { faker } from "@faker-js/faker/.";
// import { Account } from "src/domains/account.entity";
// import { NotFoundException } from "@nestjs/common";
// import { State, Policy, Type } from "src/domains/policy.entity";
// import { PolicyReadDto } from "src/contracts/policy/read-policy.dto";
// import { PolicyService } from "src/application/services/policy/policy.service";
// import { PolicyRepository } from "src/application/services/policy/repository/policy.repository";
// import { Organization, ReportDay } from "src/domains/organization.entity";
// import { PolicyCreateDto } from "src/contracts/policy/create-policy.dto";
// import { PolicyUpdateDto } from "src/contracts/policy/update-policy.dto";

// describe('PolicyService', () => {
//     let policyService: PolicyService;
//     let policyRepository: PolicyRepository;
//     beforeEach(async () => {
//         const module: TestingModule = await Test.createTestingModule({
//             imports: [WinstonModule.forRoot(winstonConfig)],
//             providers: [
//                 PolicyService,
//                 {
//                     provide: getRepositoryToken(Policy),
//                     useClass: RepositoryFake
//                 }
//             ]
//         }).compile();
//         policyService = module.get(PolicyService);
//         policyRepository = module.get(getRepositoryToken(Policy))
//     });

//     describe('find all policies', () => {
//         it('returns all policies', async () => {

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

//             const policies: PolicyReadDto[] = [
//                 {
//                     id: faker.string.uuid(),
//                     policyName: faker.book.title(),
//                     policyNumber: faker.number.int(),
//                     state: State.ACTIVE,
//                     type: Type.DIRECTIVE,
//                     dateActive: faker.date.anytime(),
//                     content: faker.book.genre(),
//                     createdAt: new Date(),
//                     updatedAt: new Date(),
//                     posts: {} as any,
//                     organization: {} as any,
//                     user: {} as any,
//                     account: account,
//                     policyToPolicyDirectories: {} as any,
//                 },
//                 {
//                     id: faker.string.uuid(),
//                     policyName: faker.book.title(),
//                     policyNumber: faker.number.int(),
//                     state: State.DRAFT,
//                     type: Type.DIRECTIVE,
//                     dateActive: faker.date.anytime(),
//                     content: faker.book.genre(),
//                     createdAt: new Date(),
//                     updatedAt: new Date(),
//                     posts: {} as any,
//                     organization: {} as any,
//                     user: {} as any,
//                     account: account,
//                     policyToPolicyDirectories: {} as any,
//                 },
//                 {
//                     id: faker.string.uuid(),
//                     policyName: faker.book.title(),
//                     policyNumber: faker.number.int(),
//                     state: State.ACTIVE,
//                     type: Type.DIRECTIVE,
//                     dateActive: faker.date.anytime(),
//                     content: faker.book.genre(),
//                     createdAt: new Date(),
//                     updatedAt: new Date(),
//                     posts: {} as any,
//                     organization: {} as any,
//                     user: {} as any,
//                     account: {} as any,
//                     policyToPolicyDirectories: {} as any,
//                 },
//             ]

//             const policyRepositoryFindAllSpy = jest.spyOn(policyRepository, 'find').mockResolvedValue(policies);

//             const result = await policyService.findAllForAccount(account);
//             expect(result).toMatchObject(policies);
//             expect(policyRepositoryFindAllSpy).toHaveBeenCalledWith({
//                 where: { account: { id: account.id } }
//             });
//         });

//         it('returns all active policies', async () => {

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

//             const policies: PolicyReadDto[] = [
//                 {
//                     id: faker.string.uuid(),
//                     policyName: faker.book.title(),
//                     policyNumber: faker.number.int(),
//                     state: State.ACTIVE,
//                     type: Type.DIRECTIVE,
//                     dateActive: faker.date.anytime(),
//                     content: faker.book.genre(),
//                     createdAt: new Date(),
//                     updatedAt: new Date(),
//                     posts: {} as any,
//                     organization: {} as any,
//                     user: {} as any,
//                     account: account,
//                     policyToPolicyDirectories: {} as any,
//                 },
//                 {
//                     id: faker.string.uuid(),
//                     policyName: faker.book.title(),
//                     policyNumber: faker.number.int(),
//                     state: State.ACTIVE,
//                     type: Type.DIRECTIVE,
//                     dateActive: faker.date.anytime(),
//                     content: faker.book.genre(),
//                     createdAt: new Date(),
//                     updatedAt: new Date(),
//                     posts: {} as any,
//                     organization: {} as any,
//                     user: {} as any,
//                     account: account,
//                     policyToPolicyDirectories: {} as any,
//                 },
//                 {
//                     id: faker.string.uuid(),
//                     policyName: faker.book.title(),
//                     policyNumber: faker.number.int(),
//                     state: State.DRAFT,
//                     type: Type.DIRECTIVE,
//                     dateActive: faker.date.anytime(),
//                     content: faker.book.genre(),
//                     createdAt: new Date(),
//                     updatedAt: new Date(),
//                     posts: {} as any,
//                     organization: {} as any,
//                     user: {} as any,
//                     account: account,
//                     policyToPolicyDirectories: {} as any,
//                 },
//             ]

//             const policyRepositoryFindAllSpy = jest.spyOn(policyRepository, 'find').mockResolvedValue(policies);

//             const result = await policyService.findAllActiveForAccount(account);
//             expect(result).toMatchObject(policies);
//             expect(policyRepositoryFindAllSpy).toHaveBeenCalledWith({
//                 where: {
//                     account: { id: account.id },
//                     state: State.ACTIVE
//                   }
//             });
//         });
//     });

//     describe('finding one policy', () => {
//         it('throws an error when a policy doesnt exist', async () => {
//             const policyId = faker.string.uuid();

//             const policyRepositoryFindOneSpy = jest
//                 .spyOn(policyRepository, 'findOne')
//                 .mockResolvedValue(null);

//             expect.assertions(3);

//             try {
//                 await policyService.findOneById(policyId);
//             } catch (e) {
//                 expect(e).toBeInstanceOf(NotFoundException);
//                 expect(e.message).toBe(`Политика с ID: ${policyId} не найдена`);
//             }

//             expect(policyRepositoryFindOneSpy).toHaveBeenCalledWith({
//                 where: { id: policyId },
//                 relations: [],
//             });
//         });

//         it('returns the found policy', async () => {
//             const policyId = faker.string.uuid();

//             const existingPolicy: PolicyReadDto = {
//                 id: policyId,
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

//             const policyRepositoryFindOneSpy = jest
//                 .spyOn(policyRepository, 'findOne')
//                 .mockResolvedValue(existingPolicy);

//             const result = await policyService.findOneById(policyId);
//             expect(result).toMatchObject(existingPolicy);
//             expect(policyRepositoryFindOneSpy).toHaveBeenCalledWith({
//                 where: { id: policyId },
//                 relations: [],
//             });
//         });
//     });

//     describe('creating an policy', () => {
//         it('calls the repository with correct paramaters', async () => {

//             const policyId = faker.string.uuid();
//             const policyName = faker.book.title();
//             const state = State.ACTIVE;
//             const type = Type.DIRECTIVE;
//             const content = faker.book.genre();

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
//                 account: null,
//             };

//             const policyCreateDto: PolicyCreateDto = {
//                 policyName: policyName,
//                 state: state,
//                 type: type,
//                 content: content,
//                 organizationId: organization.id,
//                 user: {} as any,
//                 account: account,
//                 organization: organization
//             }

//             const savedPolicy: PolicyReadDto = {
//                 id: policyId,
//                 policyName: policyName,
//                 policyNumber: faker.number.int(),
//                 state: state,
//                 type: type,
//                 dateActive: faker.date.anytime(),
//                 content: content,
//                 createdAt: new Date(),
//                 updatedAt: new Date(),
//                 posts: {} as any,
//                 organization: {} as any,
//                 user: {} as any,
//                 account: {} as any,
//                 policyToPolicyDirectories: {} as any,
//             }

//             const policyRepositoryInsertSpy = jest
//                 .spyOn(policyRepository, 'insert')
//                 .mockResolvedValue({
//                     identifiers: [{ id: savedPolicy.id }],
//                     generatedMaps: [],
//                     raw: [],
//                 });



//             const result = await policyService.create(policyCreateDto);

//             expect(policyRepositoryInsertSpy).toHaveBeenCalledWith(
//                 expect.objectContaining({
//                     policyName: policyName,
//                     state: state,
//                     type: type,
//                     content: content,
//                     user: {} as any,
//                     account: account,
//                     organization: organization
//                 }),
//             );
//             expect(result).toEqual(savedPolicy.id);
//         });
//     });


//     describe('updating a policy', () => {
//         it('throws an error when a policy doesnt exist', async () => {
//             const policyId = faker.string.uuid()
//             const policyName = faker.book.title();
//             const state = State.ACTIVE;
//             const type = Type.DIRECTIVE;
//             const content = faker.book.genre();

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
//                 account: null,
//             };
//             const updatePolicyDto: PolicyUpdateDto = {
//                 _id: policyId,
//                 policyName: policyName,
//                 state: state,
//                 type: type,
//                 content: content,
//                 organizationId: organization.id,
//                 organization: organization
//             }
//             const policyRepositoryFindOneSpy = jest
//                 .spyOn(policyRepository, 'findOne')
//                 .mockResolvedValue(null);

//             expect.assertions(3);

//             try {
//                 await policyService.update(policyId, updatePolicyDto);
//             } catch (e) {
//                 expect(e).toBeInstanceOf(NotFoundException);
//                 expect(e.message).toBe(`Политика с ID ${policyId} не найдена`);
//             }
//             expect(policyRepositoryFindOneSpy).toHaveBeenCalledWith({
//                 where: { id: policyId }
//             });
//         });

//         it('returns the updated objectiveId', async () => {
//             const policyId = faker.string.uuid()
//             const policyName = faker.book.title();
//             const state = State.ACTIVE;
//             const type = Type.DIRECTIVE;
//             const content = faker.book.genre();

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
//                 account: null,
//             };
//             const updatePolicyDto: PolicyUpdateDto = {
//                 _id: policyId,
//                 policyName: policyName,
//                 state: state,
//                 type: type,
//                 content: content,
//                 organizationId: organization.id,
//                 organization: organization
//             }

//             const existingPolicy: PolicyReadDto = {
//                 id: policyId,
//                 policyName: policyName,
//                 policyNumber: faker.number.int(),
//                 state: state,
//                 type: type,
//                 dateActive: faker.date.anytime(),
//                 content: content,
//                 createdAt: new Date(),
//                 updatedAt: new Date(),
//                 posts: {} as any,
//                 organization: {} as any,
//                 user: {} as any,
//                 account: {} as any,
//                 policyToPolicyDirectories: {} as any,
//             };

//             const policyRepositoryFindOneSpy = jest
//                 .spyOn(policyRepository, 'findOne')
//                 .mockResolvedValue(existingPolicy);

//             const policyRepositoryUpdateSpy = jest
//                 .spyOn(policyRepository, 'update')
//                 .mockResolvedValue({
//                     generatedMaps: [],
//                     raw: [],
//                     affected: 1
//                 });

//             const result = await policyService.update(policyId, updatePolicyDto);
//             expect(result).toMatch(existingPolicy.id);
//             expect(policyRepositoryFindOneSpy).toHaveBeenCalledWith({
//                 where: { id: policyId }
//             });
//             expect(policyRepositoryUpdateSpy).toHaveBeenCalledWith(
//                 policyId,
//                 expect.objectContaining({
//                     policyName: policyName,
//                     state: state,
//                     type: type,
//                     content: content,
//                     organization: organization
//                 })
//             );
//         });
//     });
// });