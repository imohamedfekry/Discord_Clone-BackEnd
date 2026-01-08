import { Controller, Get, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('Health Check')
@Controller({
  path: 'health',
  version: '1',
})
export class HealthController {
  constructor(private readonly healthService: HealthService) { }

  @Get()
  @ApiOperation({
    summary: 'Health check endpoint',
    description: 'Check if the API is running and database is connected'
  })
  @ApiResponse({
    status: 200,
    description: 'API is healthy',
    schema: {
      example: {
        status: 'success',
        code: 200,
        message: 'API is healthy',
        data: {
          status: 'ok',
          timestamp: '2025-10-19T01:00:00.000Z',
          uptime: 12345,
          database: 'connected',
          version: '1.0.0'
        }
      }
    }
  })
  @ApiResponse({
    status: 503,
    description: 'API is unhealthy',
    schema: {
      example: {
        status: 'error',
        code: 503,
        message: 'API is unhealthy',
        data: {
          status: 'error',
          timestamp: '2025-10-19T01:00:00.000Z',
          uptime: 12345,
          database: 'disconnected',
          version: '1.0.0'
        }
      }
    }
  })
  async check() {
    return this.healthService.check();
  }

  @Get('ready')
  @ApiOperation({
    summary: 'Readiness check endpoint',
    description: 'Check if the API is ready to accept requests'
  })
  @ApiResponse({
    status: 200,
    description: 'API is ready',
    schema: {
      example: {
        status: 'success',
        code: 200,
        message: 'API is ready',
        data: {
          status: 'ready',
          timestamp: '2025-10-19T01:00:00.000Z',
          database: 'connected'
        }
      }
    }
  })
  async ready() {
    return this.healthService.ready();
  }

  @Get('live')
  @ApiOperation({
    summary: 'Liveness check endpoint',
    description: 'Check if the API is alive (basic health check)'
  })
  @ApiResponse({
    status: 200,
    description: 'API is alive',
    schema: {
      example: {
        status: 'success',
        code: 200,
        message: 'API is alive',
        data: {
          status: 'alive',
          timestamp: '2025-10-19T01:00:00.000Z'
        }
      }
    }
  })
  async live() {
    return this.healthService.live();
  }
}
