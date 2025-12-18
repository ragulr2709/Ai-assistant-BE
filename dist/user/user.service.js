"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const schema_1 = require("../db/schema");
const drizzle_module_1 = require("../db/drizzle.module");
const drizzle_orm_1 = require("drizzle-orm");
let UserService = class UserService {
    db;
    constructor(db) {
        this.db = db;
    }
    async createUser(dto) {
        try {
            const isExistingUser = await this.db
                .select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.email, dto.email))
                .limit(1);
            if (isExistingUser.length) {
                throw new Error('User with this email already exists');
            }
            const newUser = await this.db
                .insert(schema_1.users)
                .values({
                name: dto.name,
                email: dto.email,
                password: dto.password,
            })
                .returning();
            return newUser;
        }
        catch (err) {
            console.error('Error creating user:', err);
            throw err;
        }
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(drizzle_module_1.DRIZZLE)),
    __metadata("design:paramtypes", [Object])
], UserService);
//# sourceMappingURL=user.service.js.map