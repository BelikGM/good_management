// app.service.ts
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  handleMessage(data: any) {
    console.log('Message received:', data);
    return 'Message processed';
  }
}
