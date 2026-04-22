"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignEmployeeRoute = exports.getEmployeeRoutes = exports.deleteSalesRoute = exports.updateSalesRoute = exports.createSalesRoute = exports.getSalesRoutes = exports.deleteArea = exports.updateArea = exports.createArea = exports.getAreas = exports.deleteCity = exports.updateCity = exports.createCity = exports.getCities = exports.getStates = void 0;
const db_1 = __importDefault(require("../config/db"));
const prisma = (0, db_1.default)();
// ─── States ───────────────────────────────────────────────
const getStates = async (req, res) => {
    try {
        const states = await prisma.state.findMany({
            include: { country: true },
            orderBy: { name: 'asc' }
        });
        res.json(states);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getStates = getStates;
// ─── Cities ───────────────────────────────────────────────
const getCities = async (req, res) => {
    try {
        const cities = await prisma.city.findMany({
            include: { state: { include: { country: true } } },
            orderBy: { name: 'asc' }
        });
        res.json(cities);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getCities = getCities;
const createCity = async (req, res) => {
    try {
        const { name, stateId, status } = req.body;
        const city = await prisma.city.create({ data: { name, stateId: Number(stateId), status: status || 'Active' } });
        res.status(201).json(city);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.createCity = createCity;
const updateCity = async (req, res) => {
    try {
        const city = await prisma.city.update({ where: { id: Number(req.params.id) }, data: req.body });
        res.json(city);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.updateCity = updateCity;
const deleteCity = async (req, res) => {
    try {
        await prisma.city.delete({ where: { id: Number(req.params.id) } });
        res.json({ message: 'City deleted' });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.deleteCity = deleteCity;
// ─── Areas ────────────────────────────────────────────────
const getAreas = async (req, res) => {
    try {
        const areas = await prisma.area.findMany({
            include: { city: true },
            orderBy: { name: 'asc' }
        });
        res.json(areas);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getAreas = getAreas;
const createArea = async (req, res) => {
    try {
        const { name, cityId, status } = req.body;
        const area = await prisma.area.create({ data: { name, cityId: Number(cityId), status: status || 'Active' } });
        res.status(201).json(area);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.createArea = createArea;
const updateArea = async (req, res) => {
    try {
        const area = await prisma.area.update({ where: { id: Number(req.params.id) }, data: req.body });
        res.json(area);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.updateArea = updateArea;
const deleteArea = async (req, res) => {
    try {
        await prisma.area.delete({ where: { id: Number(req.params.id) } });
        res.json({ message: 'Area deleted' });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.deleteArea = deleteArea;
// ─── Sales Routes ─────────────────────────────────────────
const getSalesRoutes = async (req, res) => {
    try {
        const routes = await prisma.salesRoute.findMany({
            include: { city: true, area: true, employeeRoutes: { include: { employee: true } } },
            orderBy: { routeName: 'asc' }
        });
        res.json(routes);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getSalesRoutes = getSalesRoutes;
const createSalesRoute = async (req, res) => {
    try {
        const { routeName, cityId, areaId, status } = req.body;
        const route = await prisma.salesRoute.create({
            data: { routeName, cityId: Number(cityId), areaId: Number(areaId), status: status || 'Active' }
        });
        res.status(201).json(route);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.createSalesRoute = createSalesRoute;
const updateSalesRoute = async (req, res) => {
    try {
        const route = await prisma.salesRoute.update({ where: { id: Number(req.params.id) }, data: req.body });
        res.json(route);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.updateSalesRoute = updateSalesRoute;
const deleteSalesRoute = async (req, res) => {
    try {
        await prisma.salesRoute.delete({ where: { id: Number(req.params.id) } });
        res.json({ message: 'Route deleted' });
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.deleteSalesRoute = deleteSalesRoute;
// ─── Employee Routes ───────────────────────────────────────
const getEmployeeRoutes = async (req, res) => {
    try {
        const routes = await prisma.employeeRoute.findMany({
            include: { route: { include: { city: true, area: true } }, employee: true }
        });
        res.json(routes);
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
};
exports.getEmployeeRoutes = getEmployeeRoutes;
const assignEmployeeRoute = async (req, res) => {
    try {
        const { routeId, employeeId } = req.body;
        const assignment = await prisma.employeeRoute.create({
            data: { routeId: Number(routeId), employeeId: Number(employeeId) }
        });
        res.status(201).json(assignment);
    }
    catch (err) {
        res.status(400).json({ error: err.message });
    }
};
exports.assignEmployeeRoute = assignEmployeeRoute;
//# sourceMappingURL=geoController.js.map