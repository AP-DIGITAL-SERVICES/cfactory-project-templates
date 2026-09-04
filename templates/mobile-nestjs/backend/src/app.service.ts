import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): { status: string; stack: string } {
    return { status: 'ok', stack: '{{stack}}' };
  }
}
