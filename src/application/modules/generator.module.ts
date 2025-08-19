import { GeneratorUUID } from '../services/GeneratorUUID/generator.service';
import { Module } from '@nestjs/common';

@Module({
  providers: [GeneratorUUID],
  exports: [GeneratorUUID],
})
export class GeneratorModule {}
