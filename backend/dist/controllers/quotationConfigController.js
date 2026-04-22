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
exports.updateQuotationConfigs = exports.getQuotationConfigs = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const getQuotationConfigs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const configs = yield prismaClient_1.default.quotationColumnConfig.findMany({
            orderBy: { sequence: "asc" },
        });
        res.status(200).json(configs);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
exports.getQuotationConfigs = getQuotationConfigs;
const updateQuotationConfigs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { columns } = req.body; // Array of configs
        const updates = columns.map((col) => prismaClient_1.default.quotationColumnConfig.upsert({
            where: { columnName: col.columnName },
            update: {
                visible: col.visible,
                sequence: col.sequence,
                customLabel: col.customLabel,
            },
            create: {
                columnName: col.columnName,
                visible: col.visible,
                sequence: col.sequence,
                customLabel: col.customLabel,
            },
        }));
        yield prismaClient_1.default.$transaction(updates);
        res.status(200).json({ message: "Configuration updated successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});
exports.updateQuotationConfigs = updateQuotationConfigs;
