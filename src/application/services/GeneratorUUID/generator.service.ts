import { Global, Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
@Global()
export class GeneratorUUID {
  generateUUID(): string {
    return uuidv4();
  }
}
