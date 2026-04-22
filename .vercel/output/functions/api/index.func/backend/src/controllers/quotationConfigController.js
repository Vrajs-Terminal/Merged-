"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateQuotationConfigs = exports.getQuotationConfigs = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const getQuotationConfigs = async (req, res) => {
    try {
        const configs = await prismaClient_1.default.quotationColumnConfig.findMany({
            orderBy: { sequence: "asc" },
        });
        res.status(200).json(configs);
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.getQuotationConfigs = getQuotationConfigs;
const updateQuotationConfigs = async (req, res) => {
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
        await prismaClient_1.default.$transaction(updates);
        res.status(200).json({ message: "Configuration updated successfully" });
    }
    catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
exports.updateQuotationConfigs = updateQuotationConfigs;
//# sourceMappingURL=quotationConfigController.js.map