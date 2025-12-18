import { CreateUserDto } from './dto/create-user-dto';
type DrizzleDb = import('drizzle-orm/node-postgres').NodePgDatabase;
export declare class UserService {
    private readonly db;
    constructor(db: DrizzleDb);
    createUser(dto: CreateUserDto): Promise<any>;
}
export {};
