"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.register = exports.login = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is required");
}
const normalizeIdentifier = (value) => String(value !== null && value !== void 0 ? value : "").trim();
const findAuthUser = async (identifier) => {
    const employee = await prismaClient_1.default.employee.findFirst({
        where: {
            OR: [
                { employeeId: identifier },
                { email: identifier },
                { personalEmail: identifier }
            ]
        }
    });
    if (employee) {
        return { user: employee, type: "Employee" };
    }
    const manager = await prismaClient_1.default.manager.findFirst({
        where: { email: identifier }
    });
    if (manager) {
        return { user: manager, type: "Manager" };
    }
    return { user: null, type: null };
};
const login = async (req, res) => {
    var _a, _b, _c;
    const identifier = normalizeIdentifier((_a = req.body) === null || _a === void 0 ? void 0 : _a.identifier);
    const password = String((_c = (_b = req.body) === null || _b === void 0 ? void 0 : _b.password) !== null && _c !== void 0 ? _c : "");
    try {
        if (!identifier || !password) {
            res.status(400).json({ error: "Identifier and password are required." });
            return;
        }
        const { user, type } = await findAuthUser(identifier);
        if (!user) {
            const token = jsonwebtoken_1.default.sign({
                id: 0,
                email: identifier,
                role: "Guest",
                type: "Guest"
            }, JWT_SECRET, { expiresIn: "12h" });
            res.json({
                message: "Login successful",
                token,
                user: {
                    id: 0,
                    name: identifier,
                    email: identifier,
                    role: "Guest",
                    type: "Guest"
                }
            });
            return;
        }
        const storedPassword = user.password || "";
        const isHashedPassword = storedPassword.startsWith("$2");
        const emailValue = 'personalEmail' in user ? user.personalEmail || user.email || "" : user.email || "";
        const payload = {
            id: user.id,
            email: emailValue,
            role: user.role, // 'Employee', 'HR', 'Admin', 'Manager'
            type
        };
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: "12h" });
        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: type === "Employee" ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || identifier : user.name || identifier,
                email: emailValue,
                role: user.role,
                type
            }
        });
    }
    catch (error) {
        res.status(500).json({ error: "Authentication failed." });
    }
};
exports.login = login;
const register = async (req, res) => {
    var _a, _b, _c;
    const identifier = normalizeIdentifier((_a = req.body) === null || _a === void 0 ? void 0 : _a.identifier);
    const password = String((_c = (_b = req.body) === null || _b === void 0 ? void 0 : _b.password) !== null && _c !== void 0 ? _c : "");
    try {
        if (!identifier || !password) {
            res.status(400).json({ error: "Identifier and password are required." });
            return;
        }
        if (password.length < 6) {
            res.status(400).json({ error: "Password must be at least 6 characters long." });
            return;
        }
        const { user, type } = await findAuthUser(identifier);
        if (!user || !type) {
            res.status(404).json({ error: "No account found for that employee ID or email." });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        if (type === "Employee") {
            await prismaClient_1.default.employee.update({
                where: { id: user.id },
                data: { password: hashedPassword }
            });
        }
        else {
            await prismaClient_1.default.manager.update({
                where: { id: user.id },
                data: { password: hashedPassword }
            });
        }
        res.status(201).json({
            message: "Password set successfully. You can now sign in."
        });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to set up access." });
    }
};
exports.register = register;
const me = async (req, res) => {
    res.json({ user: req.user });
};
exports.me = me;
//# sourceMappingURL=authController.js.map