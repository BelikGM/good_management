import { Module } from '@nestjs/common';
import { ConvertGateway } from 'src/gateways/convert.gateway';
import { EventsGateway } from 'src/gateways/events.gateway';
import { MessageSeenStatusModule } from './messageSeenStatus.module';
import { WatchersToConvertModule } from './watchersToConvert.module';

@Module({
  imports: [MessageSeenStatusModule, WatchersToConvertModule],
  providers: [EventsGateway, ConvertGateway],
  exports: [EventsGateway, ConvertGateway],
})
export class EventsModule {}
