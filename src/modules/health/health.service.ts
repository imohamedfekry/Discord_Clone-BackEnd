import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/database/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Complete health check including database connectivity
   */
  async check() {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    const uptime = process.uptime();

    try {
      // Check database connectivity
      await this.prisma.$queryRaw`SELECT 1`;
      const databaseStatus = 'connected';

      return {
        status: 'success',
        code: 200,
        message: 'API is healthy',
        data: {
          status: 'ok',
          timestamp,
          uptime: Math.floor(uptime),
          database: databaseStatus,
          version: process.env.npm_package_version || '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          memory: {
            used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
            total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
            unit: 'MB'
          }
        }
      };
    } catch (error) {
      return {
        status: 'error',
        code: 503,
        message: 'API is unhealthy',
        data: {
          status: 'error',
          timestamp,
          uptime: Math.floor(uptime),
          database: 'disconnected',
          version: process.env.npm_package_version || '1.0.0',
          environment: process.env.NODE_ENV || 'development',
          error: error.message
        }
      };
    }
  }

  /**
   * Readiness check - API is ready to accept requests
   */
  async ready() {
    const timestamp = new Date().toISOString();

    try {
      // Check database connectivity
      await this.prisma.$queryRaw`SELECT 1`;
      const databaseStatus = 'connected';

      return {
        status: 'success',
        code: 200,
        message: 'API is ready',
        data: {
          status: 'ready',
          timestamp,
          database: databaseStatus
        }
      };
    } catch (error) {
      return {
        status: 'error',
        code: 503,
        message: 'API is not ready',
        data: {
          status: 'not ready',
          timestamp,
          database: 'disconnected',
          error: error.message
        }
      };
    }
  }

  /**
   * Liveness check - API is alive (basic check)
   */
  async live() {
    const timestamp = new Date().toISOString();

    return {
      status: 'success',
      code: 200,
      message: 'API is alive',
      data: {
        status: 'alive',
        timestamp
      }
    };
  }
}
