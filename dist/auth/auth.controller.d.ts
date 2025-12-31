import { AuthService } from './auth.service';
declare class LoginDto {
    email: string;
    password: string;
}
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto): Promise<{
        access_token: string;
        refresh_token: `${string}-${string}-${string}-${string}-${string}`;
        user: {
            id: any;
            name: any;
            email: any;
        };
    }>;
    refresh(body: {
        email: string;
        refresh_token: string;
    }): Promise<{
        access_token: string;
        refresh_token: `${string}-${string}-${string}-${string}-${string}`;
    }>;
    getProfile(req: any): {
        message: string;
        user: any;
    };
    logout(req: any): Promise<{
        ok: boolean;
    }>;
}
export {};
