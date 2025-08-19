import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import amqp, { ChannelWrapper } from 'amqp-connection-manager';
import { ConfirmChannel } from 'amqplib';
import { AccountService } from '../account/account.service';
import { UsersService } from '../users/users.service';
import { OrganizationService } from '../organization/organization.service';
import { AccountCreateDto } from 'src/contracts/account/create-account.dto';
import { CreateUserDto } from 'src/contracts/user/create-user.dto';
import { RoleService } from '../role/role.service';
import { PostService } from '../post/post.service';
import { PolicyService } from '../policy/policy.service';
import { StatisticService } from '../statistic/statistic.service';
import { StatisticCreateDto } from 'src/contracts/statistic/create-statistic.dto';
import { Type } from 'src/domains/statistic.entity';
import { StatisticDataService } from '../statisticData/statisticData.service';
import { UpdateUserDto } from 'src/contracts/user/update-user.dto';

@Injectable()
export class ConsumerService implements OnModuleInit {
  private channelWrapper: ChannelWrapper;
  private readonly logger = new Logger(ConsumerService.name);

  constructor(
    private readonly accountService: AccountService,
    private readonly userService: UsersService,
    private readonly organizationService: OrganizationService,
    private readonly roleService: RoleService,
    private readonly postService: PostService,
    private readonly policyService: PolicyService,
    private readonly statisticService: StatisticService,
    private readonly statisticDataService: StatisticDataService,
  ) {
    if (process.env.NODE_ENV === 'dev') {
      const connection = amqp.connect(['amqp://rabbitmq']);
      this.channelWrapper = connection.createChannel();
    } else {
      const connection = amqp.connect([
        {
          hostname: `${process.env.RABBITMQ_HOSTNAME}`,
          username: `${process.env.RABBITMQ_USERNAME}`,
          password: `${process.env.RABBITMQ_PASSWORD}`,
          vhost: '/',
        },
      ]);
      this.channelWrapper = connection.createChannel();
    }
  }

  public async onModuleInit() {
    try {
      // ДЛЯ ЛОКАЛЬНЫХ ТЕСТОВ
      // Настройка очереди и потребление сообщений
      await this.channelWrapper.addSetup(async (channel: ConfirmChannel) => {
        if (process.env.NODE_ENV === 'dev') {
          await channel.assertQueue('test_events', { durable: true });
          await channel.consume('test_events', async (message) => {
            if (message) {
              const event = JSON.parse(message.content.toString());
              this.logger.log(`Received message: ${JSON.stringify(event)}`);
              channel.ack(message);
            }
          });
        } else {
          // ДЛЯ ПРОДА
          await channel.assertQueue('gm-to-nest-events', { durable: true });
          await channel.consume('gm-to-nest-events', async (message) => {
            if (message) {
              const event = JSON.parse(message.content.toString());
              this.logger.log(`Received message: ${JSON.stringify(event)}`);

              // Пример обработки события TenantCreatedEvent
              if (event.eventType === 'TENANT_CREATED') {
                this.handleTenantCreatedEvent(event);
              }

              switch (event.eventType) {
                case 'TENANT_CREATED':
                  await this.handleTenantCreatedEvent(event);
                  break;
                // case 'ORGANIZATION_CREATED':
                //   await this.handleOrganizationCreatedEvent(event);
                //   break;
                // case 'POST_CREATED':
                //   await this.handlePostCreatedEvent(event);
                //   break;
                case 'STATISTICS_CREATED':
                  await this.handleStatisticsCreatedEvent(event);
                  break;
                // case 'STATISTICS_DATA_CHANGED':
                //   await this.handleStatisticsDataUpdatedEvent(event);
                //   break;
                case 'EMPLOYEE_CREATED':
                  await this.handleEmployeeCreatedEvent(event);
                  break;
                case 'EMPLOYEE_EDITED':
                  await this.handleEmployeeUpdatedEvent(event);
                  break;
              }

              channel.ack(message);
            }
          });
        }
      });

      this.logger.log('Consumer service started and listening for messages.');
    } catch (err) {
      this.logger.error('Error starting the consumer:', err);
    }
  }

  // Обработка события TenantCreatedEvent
  private async handleTenantCreatedEvent(event: any) {
    try {
      const payload = event.payload;
      this.logger.log(
        `Handling TenantCreatedEvent: ${JSON.stringify(payload)}`,
      );
      const accountCreateDto: AccountCreateDto = {
        id: payload.company.id,
        accountName: payload.company.name,
        tenantId: payload.company.tenantId,
      };
      const createdAccount = await this.accountService.create(accountCreateDto);
      const userCreateDto: CreateUserDto = {
        id: payload.id,
        firstName: payload.firstName,
        lastName: payload.lastName,
        middleName: payload.middleName,
        telephoneNumber: payload.phone,
        account: createdAccount,
      };
      await this.userService.create(userCreateDto);
    } catch (err) {
      this.logger.error(err);
    }
  }

  // Обработка события OrganizationCreatedEvent
  // private async handleOrganizationCreatedEvent(event: any) {
  //   try {
  //     const payload = event.payload;
  //     this.logger.log(
  //       `Handling OrganizationCreatedEvent: ${JSON.stringify(payload)}`,
  //     );
  //     const account = await this.accountService.findOneById(event.accountId);
  //     const organizationCreateDto: OrganizationCreateDto = {
  //       id: payload.id,
  //       organizationName: payload.name,
  //       parentOrganizationId: payload.parentId,
  //       organizationColor: payload.organizationColor,
  //       account: account,
  //     };
  //     const createdOrganizationId = await this.organizationService.create(
  //       organizationCreateDto,
  //     );
  //     const createdOrganization = await this.organizationService.findOneById(
  //       createdOrganizationId,
  //     );
  //     const createEmployeesPromises = payload.users.map(async (user: any) => {
  //       const userCreateDto: CreateUserDto = {
  //         id: user.id,
  //         firstName: user.firstName,
  //         lastName: user.lastName,
  //         middleName: user.middleName,
  //         telephoneNumber: user.phone,
  //         account: account,
  //       };
  //       return await this.userService.create(userCreateDto);
  //     });
  //     await Promise.all(createEmployeesPromises);

  //     const createPostsPromises = payload.posts.map(async (post: any) => {
  //       const responsibleUser =
  //         post.userId !== null
  //           ? await this.userService.findOne(post.userId)
  //           : null;
  //       const policy =
  //         post.policyId !== null
  //           ? await this.policyService.findOneById(post.policyId)
  //           : null;
  //       const postCreateDto: PostCreateDto = {
  //         id: post.id,
  //         postName: post.name,
  //         divisionName: post.divisionName,
  //         parentId: post.parentId,
  //         product: post.valuableEndProduct,
  //         purpose: post.perfectPicture,
  //         user: responsibleUser,
  //         organizationId: createdOrganization.id,
  //         organization: createdOrganization,
  //         policy: policy,
  //         account: account,
  //       };
  //       return await this.postService.create(postCreateDto);
  //     });
  //     await Promise.all(createPostsPromises);
  //     // Здесь можно реализовать сохранение данных или другую логику
  //   }
  //   catch (err) {
  //     this.logger.error(err);

  //   }
  // }

  // Обработка события PostCreatedEvent
  // private async handlePostCreatedEvent(event: any) {
  //   try {
  //     const payload = event.payload;
  //     this.logger.log(`Handling PostCreatedEvent: ${JSON.stringify(payload)}`);

  //     const account = await this.accountService.findOneById(event.accountId);
  //     const responsibleUser =
  //       payload.userId !== null
  //         ? await this.userService.findOne(payload.userId)
  //         : null;
  //     const policy =
  //       payload.policyId !== null
  //         ? await this.policyService.findOneById(payload.policyId)
  //         : null;
  //     const organization = await this.organizationService.findOneById(
  //       payload.organizationId,
  //     );
  //     const postCreateDto: PostCreateDto = {
  //       id: payload.id,
  //       postName: payload.name,
  //       divisionName: payload.divisionName,
  //       parentId: payload.parentId,
  //       product: payload.valuableEndProduct,
  //       purpose: payload.perfectPicture,
  //       user: responsibleUser,
  //       organizationId: organization.id,
  //       organization: organization,
  //       policy: policy,
  //       account: account,
  //     };
  //     return await this.postService.create(postCreateDto);
  //   }
  //   catch (err) {
  //     this.logger.error(err);
  //   }
  // }

  // Обработка события StatisticsCreatedEvent
  private async handleStatisticsCreatedEvent(event: any) {
    try {
      const payload = event.payload;
      this.logger.log(
        `Handling StatisticsCreatedEvent: ${JSON.stringify(payload)}`,
      );

      const account = await this.accountService.findOneById(event.accountId);
      const post = await this.postService.findOneById(
        payload.responsiblePostId,
      );
      const statisticCreateDto: StatisticCreateDto = {
        id: payload.id,
        name: payload.name,
        type: payload.type as Type,
        description: payload.description,
        postId: payload.responsiblePostId,
        post: post,
        account: account,
      };
      return await this.statisticService.create(statisticCreateDto);
    } catch (err) {
      this.logger.error(err);
    }
  }

  // private async handleStatisticsDataUpdatedEvent(event: any) {
  //   const payload = event.payload;
  //   this.logger.log(`Handling StatisticsDataUpdatedEvent: ${JSON.stringify(payload)}`);
  //   const updateStatisticDataPromises = payload.data.map(async (statisticData) => {

  //     const statisticDataUpdateDto: StatisticDataUpdateDto = {
  //       _id: statisticData.,
  //       value: statisticData.actual,
  //       valueDate: statisticData.date as Date,
  //     }
  //     return this.statisticDataService.update(statisticDataUpdateDto)
  //   });
  //   await Promise.all(updateStatisticDataPromises);
  // }

  private async handleEmployeeCreatedEvent(event: any) {
    try {
      const payload = event.payload;
      this.logger.log(
        `Handling EmployeeCreatedEvent: ${JSON.stringify(payload)}`,
      );
      const account = await this.accountService.findOneById(event.accountId);
      const userCreateDto: CreateUserDto = {
        id: payload.id,
        firstName: payload.firstName,
        lastName: payload.lastName,
        middleName: payload.middleName,
        telephoneNumber: payload.phone,
        account: account,
      };
      return await this.userService.create(userCreateDto);
    } catch (err) {
      this.logger.error(err);
    }
  }

  private async handleEmployeeUpdatedEvent(event: any) {
    try {
      const payload = event.payload;
      this.logger.log(
        `Handling EmployeeUpdatedEvent: ${JSON.stringify(payload)}`,
      );
      const account = await this.accountService.findOneById(event.accountId);

      const userUpdateDto: UpdateUserDto = {
        id: payload.id,
        firstName: payload.firstName,
        lastName: payload.lastName,
        middleName: payload.middleName,
        telephoneNumber: payload.phone,
      };
      return await this.userService.update(userUpdateDto.id, userUpdateDto);
    } catch (err) {
      this.logger.error(err);
    }
  }
}
