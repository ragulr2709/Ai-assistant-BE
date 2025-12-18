"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const configuration_1 = __importDefault(require("./configs/configuration"));
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const user_controller_1 = require("./user/user.controller");
const user_service_1 = require("./user/user.service");
const drizzle_module_1 = require("./db/drizzle.module");
const user_module_1 = require("./user/user.module");
const auth_module_1 = require("./auth/auth.module");
const knowledge_base_module_1 = require("./knowledge-base/knowledge-base.module");
const agent_module_1 = require("./agent/agent.module");
const document_module_1 = require("./document/document.module");
const chat_module_1 = require("./chats/chat.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
            }),
            drizzle_module_1.DbModule,
            user_module_1.UserModule,
            auth_module_1.AuthModule,
            knowledge_base_module_1.KnowledgeBaseModule,
            agent_module_1.AgentModule,
            document_module_1.DocumentModule,
            chat_module_1.ChatModule,
        ],
        controllers: [app_controller_1.AppController, user_controller_1.UserController],
        providers: [app_service_1.AppService, user_service_1.UserService],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map