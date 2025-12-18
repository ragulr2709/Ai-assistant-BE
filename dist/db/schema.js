"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatMessages = exports.documentChunks = exports.documents = exports.users = void 0;
var user_1 = require("./user");
Object.defineProperty(exports, "users", { enumerable: true, get: function () { return user_1.users; } });
var document_1 = require("./document");
Object.defineProperty(exports, "documents", { enumerable: true, get: function () { return document_1.documents; } });
Object.defineProperty(exports, "documentChunks", { enumerable: true, get: function () { return document_1.documentChunks; } });
var chats_1 = require("./chats");
Object.defineProperty(exports, "chatMessages", { enumerable: true, get: function () { return chats_1.chatMessages; } });
//# sourceMappingURL=schema.js.map