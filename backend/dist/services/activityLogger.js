"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = logActivity;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
function logActivity(userId, action, entityType, entityName, details) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield prismaClient_1.default.activityLog.create({
                data: {
                    user_id: userId,
                    action,
                    entity_type: entityType,
                    entity_name: entityName,
                    details: details ? JSON.stringify(details) : null
                }
            });
        }
        catch (error) {
            console.error('Failed to log activity:', error);
        }
    });
}
