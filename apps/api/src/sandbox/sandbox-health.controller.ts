import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class SandboxHealthController {
  @Get()
  getHealth() {
    return {
      status: 'ok',
      service: 'nextdream-api',
      database: 'sandbox-memory',
      timestamp: new Date().toISOString(),
    };
  }
}
