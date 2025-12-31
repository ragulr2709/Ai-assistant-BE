import { JwtService } from '@nestjs/jwt';
type DrizzleDb = import('drizzle-orm/node-postgres').NodePgDatabase;
export interface JwtPayload {
    sub: string;
    email: string;
}
export declare class AuthService {
    private readonly jwtService;
    private readonly db;
    constructor(jwtService: JwtService, db: DrizzleDb);
    validateUser(email: string, password: string): Promise<any>;
    findUserByEmail(email: string): Promise<any>;
    login(email: string, password: string): Promise<{
        access_token: string;
        refresh_token: `${string}-${string}-${string}-${string}-${string}`;
        user: {
            id: any;
            name: any;
            email: any;
        };
    }>;
    refresh(email: string, refreshToken: string): Promise<{
        access_token: string;
        refresh_token: `${string}-${string}-${string}-${string}-${string}`;
    }>;
    revokeRefreshToken(userId: string): Promise<{
        revoked: boolean;
    }>;
    private hashToken;
}
export {};
