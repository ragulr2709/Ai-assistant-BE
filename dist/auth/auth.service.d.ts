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
        user: {
            id: any;
            name: any;
            email: any;
        };
    }>;
}
export {};
