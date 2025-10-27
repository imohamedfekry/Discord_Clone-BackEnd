import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../guards/auth.guards';

/**
 * WebSocket Authentication Decorator
 * Applies authentication guard to WebSocket events
 */
export function WSAuth() {
  return applyDecorators(
    UseGuards(AuthGuard),
  );
}

