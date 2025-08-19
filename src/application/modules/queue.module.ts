import { forwardRef, Module } from '@nestjs/common';
import { ProducerService } from '../services/producer/producer.service';
import { ConsumerService } from '../services/consumer/consumer.service';
import { UsersModule } from './users.module';
import { AccountModule } from './account.module';
import { OrganizationModule } from './organization.module';
import { RoleSettingModule } from './roleSetting.module';
import { RoleModule } from './role.module';
import { PostModule } from './post.module';
import { PolicyModule } from './policy.module';
import { StatisticModule } from './statistic.module';
import { StatisticDataModule } from './statisticData.module';

@Module({
  imports: [
    forwardRef(() => UsersModule),
    forwardRef(() => AccountModule),
    OrganizationModule,
    RoleSettingModule,
    RoleModule,
    forwardRef(() => PostModule),
    forwardRef(() => PolicyModule),
    StatisticModule,
    StatisticDataModule,
  ],
  providers: [ProducerService, ConsumerService],
  exports: [ProducerService],
})
export class QueueModule {}
