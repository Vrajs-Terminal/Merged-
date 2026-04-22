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
exports.getLevelHierarchy = exports.getHierarchy = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const getHierarchy = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { rootId } = req.query; // Optional: specify root user
        // Fetch all active employees
        const employees = yield prismaClient_1.default.employee.findMany({
            where: { status: 'Active' },
            select: {
                id: true,
                employeeId: true,
                firstName: true,
                lastName: true,
                managerId: true,
                designationRef: { select: { name: true } },
                level: { select: { name: true } }
            }
        });
        // Map them by ID for quick access
        const empMap = new Map();
        employees.forEach(emp => {
            var _a, _b;
            empMap.set(emp.id, Object.assign(Object.assign({}, emp), { designationName: ((_a = emp.designationRef) === null || _a === void 0 ? void 0 : _a.name) || "No Role", levelName: ((_b = emp.level) === null || _b === void 0 ? void 0 : _b.name) || "No Level", children: [] }));
        });
        let hierarchy = [];
        let specificRoot = rootId ? parseInt(rootId) : null;
        empMap.forEach(emp => {
            if (emp.managerId) {
                const manager = empMap.get(emp.managerId);
                if (manager) {
                    manager.children.push(emp);
                }
                else if (!specificRoot) {
                    // Manager deleted or inactive, treat as root
                    hierarchy.push(emp);
                }
            }
            else if (!specificRoot) {
                // No manager, top level
                hierarchy.push(emp);
            }
        });
        if (specificRoot) {
            const rootNode = empMap.get(specificRoot);
            if (rootNode)
                hierarchy = [rootNode];
        }
        res.json(hierarchy);
    }
    catch (error) {
        console.error("Hierarchy error:", error);
        res.status(500).json({ error: "Failed to fetch hierarchy" });
    }
});
exports.getHierarchy = getHierarchy;
const getLevelHierarchy = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const levels = yield prismaClient_1.default.level.findMany({
            where: { status: 'Active' },
            include: {
                _count: { select: { users: true } }
            }
        });
        const levelMap = new Map();
        levels.forEach((l) => {
            levelMap.set(l.id, Object.assign(Object.assign({}, l), { employeeCount: l._count.users, children: [] }));
        });
        let hierarchy = [];
        levelMap.forEach(l => {
            if (l.parentLevelId) {
                const parent = levelMap.get(l.parentLevelId);
                if (parent) {
                    parent.children.push(l);
                }
                else {
                    hierarchy.push(l);
                }
            }
            else {
                hierarchy.push(l);
            }
        });
        res.json(hierarchy);
    }
    catch (error) {
        console.error("Level Hierarchy error:", error);
        res.status(500).json({ error: "Failed to fetch level hierarchy" });
    }
});
exports.getLevelHierarchy = getLevelHierarchy;
