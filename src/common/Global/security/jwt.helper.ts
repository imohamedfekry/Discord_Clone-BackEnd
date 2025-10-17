import { JwtService } from '@nestjs/jwt';

export class JwtHelper {
  constructor(private readonly jwtService: JwtService) {}

  /**
   * Generate JWT token
   */
  generateToken(payload: any): string {
    return this.jwtService.sign(payload);
  }

  /**
   * Verify JWT token
   */
  verifyToken(token: string): any {
    return this.jwtService.verify(token);
  }
}
