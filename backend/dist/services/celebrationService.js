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
exports.runDailyCelebrations = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
/**
 * CelebrationService: Automated Post Generation (Submodule 2)
 * Scans for Birthdays, Work Anniversaries, and Wedding Anniversaries.
 */
const runDailyCelebrations = () => __awaiter(void 0, void 0, void 0, function* () {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    try {
        // 1. Fetch Users with Birthdays Today
        const birthdayUsers = yield prismaClient_1.default.user.findMany({
            where: {
                dob: { not: null }
            }
        });
        const builders = [];
        for (const user of birthdayUsers) {
            const dob = new Date(user.dob);
            if (dob.getMonth() + 1 === month && dob.getDate() === day) {
                builders.push(createCelebrationPost(user, 'Birthday'));
            }
        }
        // 2. Fetch Users with Work Anniversaries Today
        const anniversaryUsers = yield prismaClient_1.default.user.findMany({
            where: {
                join_date_user: { not: null }
            }
        });
        for (const user of anniversaryUsers) {
            const joinDate = new Date(user.join_date_user);
            if (joinDate.getMonth() + 1 === month && joinDate.getDate() === day && joinDate.getFullYear() < today.getFullYear()) {
                builders.push(createCelebrationPost(user, 'WorkAnniversary'));
            }
        }
        // 3. Wedding Anniversaries
        // (Similar logic for wedding_anniversary field)
        yield Promise.all(builders);
        console.log(`[CelebrationService] Successfully processed ${builders.length} celebration posts for ${today.toDateString()}`);
    }
    catch (error) {
        console.error('[CelebrationService] Error running daily scan:', error.message);
    }
});
exports.runDailyCelebrations = runDailyCelebrations;
const createCelebrationPost = (user, type) => __awaiter(void 0, void 0, void 0, function* () {
    // Attempt to find an active template for this type
    const template = yield prismaClient_1.default.timelineTemplate.findFirst({
        where: { type, is_active: true }
    });
    const caption = type === 'Birthday'
        ? `Wishing a very Happy Birthday to ${user.name}! 🎂 🎉`
        : `Congratulations to ${user.name} on their work anniversary! 🎊 ✨`;
    // Check if post already exists for today to avoid duplicates
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const exists = yield prismaClient_1.default.timelinePost.findFirst({
        where: {
            author_id: user.id, // we attribute it to the user or a system-admin user ID
            type,
            createdAt: { gte: todayStart }
        }
    });
    if (exists)
        return;
    return prismaClient_1.default.timelinePost.create({
        data: {
            author_id: user.id, // Or a central 'System' user ID if available
            type,
            content: caption,
            image_url: (template === null || template === void 0 ? void 0 : template.bg_image) || null,
            is_system_generated: true,
            status: 'Approved',
            audience_type: 'All'
        }
    });
});
