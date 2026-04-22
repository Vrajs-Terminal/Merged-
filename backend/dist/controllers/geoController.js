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
exports.assignEmployeeRoute = exports.getEmployeeRoutes = exports.deleteSalesRoute = exports.updateSalesRoute = exports.createSalesRoute = exports.getSalesRoutes = exports.deleteArea = exports.updateArea = exports.createArea = exports.getAreas = exports.deleteCity = exports.updateCity = exports.createCity = exports.getCities = exports.getStates = void 0;
const db_1 = __importDefault(require("../config/db"));
const prisma = (0, db_1.default)();
// ─── States ───────────────────────────────────────────────
const getStates = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const states = yield prisma.state.findMany({
            include: { country: true },
            orderBy: { name: 'asc' }
        });
        res.json(states);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.getStates = getStates;
// ─── Cities ───────────────────────────────────────────────
const getCities = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const cities = yield prisma.city.findMany({
            include: { state: { include: { country: true } } },
            orderBy: { name: 'asc' }
        });
        res.json(cities);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.getCities = getCities;
const createCity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, stateId, status } = req.body;
        const city = yield prisma.city.create({ data: { name, stateId: Number(stateId), status: status || 'Active' } });
        res.status(201).json(city);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.createCity = createCity;
const updateCity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const city = yield prisma.city.update({ where: { id: Number(req.params.id) }, data: req.body });
        res.json(city);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.updateCity = updateCity;
const deleteCity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma.city.delete({ where: { id: Number(req.params.id) } });
        res.json({ message: 'City deleted' });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.deleteCity = deleteCity;
// ─── Areas ────────────────────────────────────────────────
const getAreas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const areas = yield prisma.area.findMany({
            include: { city: true },
            orderBy: { name: 'asc' }
        });
        res.json(areas);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.getAreas = getAreas;
const createArea = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, cityId, status } = req.body;
        const area = yield prisma.area.create({ data: { name, cityId: Number(cityId), status: status || 'Active' } });
        res.status(201).json(area);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.createArea = createArea;
const updateArea = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const area = yield prisma.area.update({ where: { id: Number(req.params.id) }, data: req.body });
        res.json(area);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.updateArea = updateArea;
const deleteArea = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma.area.delete({ where: { id: Number(req.params.id) } });
        res.json({ message: 'Area deleted' });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.deleteArea = deleteArea;
// ─── Sales Routes ─────────────────────────────────────────
const getSalesRoutes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const routes = yield prisma.salesRoute.findMany({
            include: { city: true, area: true, employeeRoutes: { include: { employee: true } } },
            orderBy: { routeName: 'asc' }
        });
        res.json(routes);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.getSalesRoutes = getSalesRoutes;
const createSalesRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { routeName, cityId, areaId, status } = req.body;
        const route = yield prisma.salesRoute.create({
            data: { routeName, cityId: Number(cityId), areaId: Number(areaId), status: status || 'Active' }
        });
        res.status(201).json(route);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.createSalesRoute = createSalesRoute;
const updateSalesRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const route = yield prisma.salesRoute.update({ where: { id: Number(req.params.id) }, data: req.body });
        res.json(route);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.updateSalesRoute = updateSalesRoute;
const deleteSalesRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield prisma.salesRoute.delete({ where: { id: Number(req.params.id) } });
        res.json({ message: 'Route deleted' });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.deleteSalesRoute = deleteSalesRoute;
// ─── Employee Routes ───────────────────────────────────────
const getEmployeeRoutes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const routes = yield prisma.employeeRoute.findMany({
            include: { route: { include: { city: true, area: true } }, employee: true }
        });
        res.json(routes);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
});
exports.getEmployeeRoutes = getEmployeeRoutes;
const assignEmployeeRoute = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { routeId, employeeId } = req.body;
        const assignment = yield prisma.employeeRoute.create({
            data: { routeId: Number(routeId), employeeId: Number(employeeId) }
        });
        res.status(201).json(assignment);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
});
exports.assignEmployeeRoute = assignEmployeeRoute;
