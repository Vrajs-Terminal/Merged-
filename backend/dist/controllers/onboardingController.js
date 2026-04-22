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
exports.updateOnboarding = exports.createOnboarding = exports.getOnboardingByEmployeeId = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const getOnboardingByEmployeeId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employeeId } = req.params;
        const onboarding = yield prismaClient_1.default.onboarding.findFirst({
            where: { employeeId },
        });
        if (!onboarding) {
            res.status(404).json({ message: "Onboarding record not found" });
            return;
        }
        res.status(200).json(onboarding);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.getOnboardingByEmployeeId = getOnboardingByEmployeeId;
const createOnboarding = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        const onboarding = yield prismaClient_1.default.onboarding.create({
            data,
        });
        res.status(201).json(onboarding);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.createOnboarding = createOnboarding;
const updateOnboarding = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { employeeId } = req.params;
        const data = req.body;
        // We update by employeeId. Since there could be multiple or one, we update the first one found or use updateMany.
        // Using updateMany is safer when not updating by unique ID.
        const onboarding = yield prismaClient_1.default.onboarding.updateMany({
            where: { employeeId },
            data,
        });
        res.status(200).json(onboarding);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});
exports.updateOnboarding = updateOnboarding;
