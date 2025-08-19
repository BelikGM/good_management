import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class CustomParseIntPipe implements PipeTransform<string, number> {
  transform(value: string, metadata: ArgumentMetadata): number {
    let val = parseInt(value, 10);
    if (isNaN(val) || val < 0) {
      val = 0;
    }
    return val;
  }
}
