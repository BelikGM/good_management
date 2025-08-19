import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './application/modules/users.module';
import { ConfigModule, ConfigService } from 'nestjs-config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './application/modules/auth.module';
import * as path from 'path';
import { EventsModule } from './application/modules/events.module';
import { TelegramModule } from './application/modules/telegram.module';
import { OrganizationModule } from './application/modules/organization.module';
import { AccountModule } from './application/modules/account.module';
import { PolicyModule } from './application/modules/policy.module';
import { GoalModule } from './application/modules/goal.module';
import { ObjectiveModule } from './application/modules/objective.module';
import { StrategyModule } from './application/modules/strategy.module';
import { ProjectModule } from './application/modules/project.module';
import { TargetModule } from './application/modules/target.module';
import { TargetHolderModule } from './application/modules/targetHolder.module';
import { PostModule } from './application/modules/post.module';
import { RequestLoggerMiddleware } from './middleware/request-logger.middleware';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './utils/winston-logger';
import { StatisticModule } from './application/modules/statistic.module';
import { FileUploadModule } from './application/modules/file-upload.module';
import { FileModule } from './application/modules/file.module';
import { RoleSettingModule } from './application/modules/roleSetting.module';
import { RoleModule } from './application/modules/role.module';
import { QueueModule } from './application/modules/queue.module';
import { PolicyToPolicyDirectoryModule } from './application/modules/policyToPolicyDirectory.module';
import { PolicyDirectoryModule } from './application/modules/policyDirectory.module';
import { ConvertModule } from './application/modules/convert.module';
import { ConvertToPostModule } from './application/modules/convertToPost.module';
import { MessageModule } from './application/modules/message.module';
import { GroupModule } from './application/modules/group.module';
import { GroupToPostModule } from './application/modules/groupToPost.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as dotenv from 'dotenv';
import { ControlPanelModule } from './application/modules/controlPanel.module';
import { PanelToStatisticModule } from './application/modules/panelToStatistic.module';
import { CacheModule } from '@nestjs/cache-manager';
import KeyvRedis from '@keyv/redis';
import { AttachmentModule } from './application/modules/attachment.module';
import { AttachmentToMessageModule } from './application/modules/attachmentToMessage.module';
import { AttachmentToTargetModule } from './application/modules/attachmentToTarget.module';
import { RedisModule } from '@nestjs-modules/ioredis';
import { MessageSeenStatusModule } from './application/modules/messageSeenStatus.module';
import { WatchersToConvertModule } from './application/modules/watchersToConvert.module';
import { TransactionModule } from 'nestjs-transaction';

dotenv.config();

@Module({
  imports: [
    ConfigModule.load(
      path.resolve(__dirname, 'config', '**', '!(*.d).{ts,js}'),
    ),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.get('database'),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => {
        return {
          stores: [
            new KeyvRedis(
              {
                url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST_LOCAL}:${process.env.REDIS_PORT}`,
                username: `${process.env.REDIS_USERNAME}`,
                password: `${process.env.REDIS_PASSWORD}`,
              },
              {
                namespace: 'goodmanagement',
              },
            ),
          ],
        };
      },
    }),
    RedisModule.forRootAsync({
      useFactory: () => ({
        type: 'single',
        url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST_LOCAL}:${process.env.REDIS_PORT}`,
      }),
    }),
    ServeStaticModule.forRoot({
      rootPath: process.env.UPLOADS_PATH,
      serveRoot: '/app/uploads',
    }),
    TransactionModule.forRoot(),
    WinstonModule.forRoot(winstonConfig),
    UsersModule,
    AuthModule,
    TelegramModule,
    OrganizationModule,
    AccountModule,
    PolicyModule,
    GoalModule,
    ObjectiveModule,
    ProjectModule,
    StrategyModule,
    TargetModule,
    TargetHolderModule,
    PostModule,
    StatisticModule,
    FileUploadModule,
    FileModule,
    RoleSettingModule,
    RoleModule,
    QueueModule,
    PolicyToPolicyDirectoryModule,
    PolicyDirectoryModule,
    ConvertModule,
    ConvertToPostModule,
    MessageModule,
    EventsModule,
    GroupModule,
    GroupToPostModule,
    ControlPanelModule,
    PanelToStatisticModule,
    AttachmentModule,
    AttachmentToTargetModule,
    AttachmentToMessageModule,
    MessageSeenStatusModule,
    WatchersToConvertModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
