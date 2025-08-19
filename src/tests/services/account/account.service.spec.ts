// import { Test, TestingModule } from '@nestjs/testing';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { RepositoryFake } from '../FakeClasses/repositoryFake';
// import { BadRequestException, NotFoundException } from '@nestjs/common';
// import { faker } from '@faker-js/faker';
// import { AccountCreateDto } from '../../../contracts/account/create-account.dto';
// import { Account } from '../../../domains/account.entity';
// import { AccountRepository } from '../../../application/services/account/repository/account.repository';
// import { AccountService } from '../../../application/services/account/account.service';
// import { WinstonModule } from 'nest-winston';
// import { winstonConfig } from 'src/utils/winston-logger';
// import { ReportDay } from 'src/domains/organization.entity';

// describe('AccountService', () => {
//   let accountService: AccountService;
//   let accountRepository: AccountRepository;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       imports: [WinstonModule.forRoot(winstonConfig)],
//       providers: [
//         AccountService,
//         {
//           provide: getRepositoryToken(Account),
//           useClass: RepositoryFake,
//         },
//       ],
//     }).compile();

//     accountService = module.get(AccountService);
//     accountRepository = module.get(getRepositoryToken(Account));
//   });

//   describe('creating an account', () => {
//     it('throws an error when validation error is provided', async () => {
//       expect.assertions(2);

//       try {
//         await accountService.create({
//           id: '',
//           accountName: 'test',
//           tenantId: 'c57ea086-f439-4ee6-b618-74e4a780937d',
//         });
//       } catch (e) {
//         expect(e).toBeInstanceOf(BadRequestException);
//         expect(e.message).toBe('Id аккаунта не может быть пустой');
//       }
//     });

//     it('calls the repository with correct paramaters', async () => {
//       const id = faker.string.uuid();
//       const accountName = faker.company.name();
//       const tenantId = faker.string.uuid();

//       const accountCreateDto: AccountCreateDto = {
//         id,
//         accountName,
//         tenantId,
//       };

//       const savedAccount: Account = {
//         id: id,
//         accountName: accountName,
//         tenantId: tenantId,
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

//       const accountRepositorySaveSpy = jest
//         .spyOn(accountRepository, 'save')
//         .mockResolvedValue(savedAccount);

//       const result = await accountService.create(accountCreateDto);

//       expect(accountRepositorySaveSpy).toBeCalledWith(
//         expect.objectContaining({
//           id: accountCreateDto.id,
//           accountName: accountCreateDto.accountName,
//           tenantId: accountCreateDto.tenantId,
//         }),
//       );
//       expect(result).toEqual(savedAccount);
//     });
//   });

//   describe('finding an account', () => {
//     it('throws an error when an account doesnt exist', async () => {
//       const accountId = faker.string.uuid();

//       const accountRepositoryFindOneSpy = jest
//         .spyOn(accountRepository, 'findOne')
//         .mockResolvedValue(null);

//       expect.assertions(3);

//       try {
//         await accountService.findOneById(accountId, ['users', 'organizations']);
//       } catch (e) {
//         expect(e).toBeInstanceOf(NotFoundException);
//         expect(e.message).toBe('Аккаунт не найден!');
//       }

//       expect(accountRepositoryFindOneSpy).toHaveBeenCalledWith({
//         where: { id: accountId },
//         relations: ['users', 'organizations'],
//       });
//     });

//     it('returns the found account', async () => {
//       const accountId = faker.string.uuid();

//       const existingAccount: Account = {
//         id: accountId,
//         accountName: faker.company.name(),
//         tenantId: faker.string.uuid(),
//         createdAt: new Date(),
//         updatedAt: new Date(),
//         users: [
//           {
//             id: faker.string.uuid(),
//             firstName: faker.person.firstName(),
//             lastName: faker.person.lastName(),
//             middleName: faker.person.middleName(),
//             telephoneNumber: faker.phone.number({ style: 'international' }),
//             telegramId: faker.number.int(),
//             avatar_url: faker.internet.url(),
//             vk_id: faker.number.int(),
//             createdAt: new Date(),
//             updatedAt: new Date(),
//             posts: null,
//             refreshSessions: null,
//             goals: null,
//             policies: null,
//             strategies: null,
//             targetHolders: null,
//             projects: null,
//             convert: null,
//             messages: null,
//             convertToUsers: null,
//             groupToUsers: null,
//             organization: null,
//             account: null,
//             role: null,
//             historiesUsersToPost: null
//           },
//         ],
//         organizations: [
//           {
//             id: faker.string.uuid(),
//             organizationName: faker.company.name(),
//             parentOrganizationId: null,
//             reportDay: ReportDay.FRIDAY,
//             createdAt: new Date(),
//             updatedAt: new Date(),
//             goal: null,
//             users: null,
//             posts: null,
//             policies: null,
//             projects: null,
//             strategies: null,
//             account: null,
//           },
//         ],
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

//       const accountRepositoryFindOneSpy = jest
//         .spyOn(accountRepository, 'findOne')
//         .mockResolvedValue(existingAccount);

//       const result = await accountService.findOneById(accountId, [
//         'users',
//         'organizations',
//       ]);

//       expect(result).toStrictEqual(existingAccount);
//       expect(accountRepositoryFindOneSpy).toHaveBeenCalledWith({
//         where: { id: accountId },
//         relations: ['users', 'organizations'],
//       });
//     });
//   });
// });
