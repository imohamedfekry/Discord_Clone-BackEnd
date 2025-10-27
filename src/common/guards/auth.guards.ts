import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtHelper } from "../Global/security/jwt.helper";

interface AuthenticatedSocket {
  userId?: string;
  authenticated?: boolean;
  user?: any;
  handshake: {
    auth?: any;
    headers?: any;
  };
}

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtHelper: JwtHelper,
    ) {
    }
    
    async canActivate(context: ExecutionContext): Promise<boolean> {
        // Detect request type (HTTP or WebSocket)
        const type = context.getType();
        
        let token: string;
        let request: any;

        if (type === 'ws') {
            // WebSocket request
            const client : AuthenticatedSocket = context.switchToWs().getClient();
            request = client;
            token = client.handshake.auth?.token || client.handshake.headers?.authorization;
        } else {
            // HTTP request
            request = context.switchToHttp().getRequest<Request>();
            token = request.headers['authorization'];
        }
        
        // Extract, verify token and get user in one step
        const user = await this.jwtHelper.extractAndVerifyUser(token);
        
        if (!user) {
            throw new UnauthorizedException('Forbidden resource. Invalid or missing token');
        }
        
        // Attach user to request (works for both HTTP and WebSocket)
        if (type === 'ws') {
            // For WebSocket: attach user to client
            const wsClient = request as AuthenticatedSocket;
            (wsClient as any).user = user;
            wsClient.userId = user.id;
            wsClient.authenticated = true;
        } else {
            // For HTTP: attach user to request
            request['user'] = user;
        }
        
        return true;
    }
}