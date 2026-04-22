"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = logActivity;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
async function logActivity(userId, action, entityType, entityName, details) {
    try {
        await prismaClient_1.default.activityLog.create({
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
}
//# sourceMappingURL=activityLogger.js.map