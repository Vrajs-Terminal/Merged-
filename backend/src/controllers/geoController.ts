import type { Request, Response } from 'express';
import getPrismaClient from '../config/db';

const prisma = getPrismaClient();

// ─── States ───────────────────────────────────────────────
export const getStates = async (req: Request, res: Response) => {
  try {
    const states = await prisma.state.findMany({
      include: { country: true },
      orderBy: { name: 'asc' }
    });
    res.json(states);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

// ─── Cities ───────────────────────────────────────────────
export const getCities = async (req: Request, res: Response) => {
  try {
    const cities = await prisma.city.findMany({
      include: { state: { include: { country: true } } },
      orderBy: { name: 'asc' }
    });
    res.json(cities);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createCity = async (req: Request, res: Response) => {
  try {
    const { name, stateId, status } = req.body;
    const city = await prisma.city.create({ data: { name, stateId: Number(stateId), status: status || 'Active' } });
    res.status(201).json(city);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const updateCity = async (req: Request, res: Response) => {
  try {
    const city = await prisma.city.update({ where: { id: Number(req.params.id) }, data: req.body });
    res.json(city);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteCity = async (req: Request, res: Response) => {
  try {
    await prisma.city.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'City deleted' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// ─── Areas ────────────────────────────────────────────────
export const getAreas = async (req: Request, res: Response) => {
  try {
    const areas = await prisma.area.findMany({
      include: { city: true },
      orderBy: { name: 'asc' }
    });
    res.json(areas);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createArea = async (req: Request, res: Response) => {
  try {
    const { name, cityId, status } = req.body;
    const area = await prisma.area.create({ data: { name, cityId: Number(cityId), status: status || 'Active' } });
    res.status(201).json(area);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const updateArea = async (req: Request, res: Response) => {
  try {
    const area = await prisma.area.update({ where: { id: Number(req.params.id) }, data: req.body });
    res.json(area);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteArea = async (req: Request, res: Response) => {
  try {
    await prisma.area.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Area deleted' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// ─── Sales Routes ─────────────────────────────────────────
export const getSalesRoutes = async (req: Request, res: Response) => {
  try {
    const routes = await prisma.salesRoute.findMany({
      include: { city: true, area: true, employeeRoutes: { include: { employee: true } } },
      orderBy: { routeName: 'asc' }
    });
    res.json(routes);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createSalesRoute = async (req: Request, res: Response) => {
  try {
    const { routeName, cityId, areaId, status } = req.body;
    const route = await prisma.salesRoute.create({
      data: { routeName, cityId: Number(cityId), areaId: Number(areaId), status: status || 'Active' }
    });
    res.status(201).json(route);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const updateSalesRoute = async (req: Request, res: Response) => {
  try {
    const route = await prisma.salesRoute.update({ where: { id: Number(req.params.id) }, data: req.body });
    res.json(route);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteSalesRoute = async (req: Request, res: Response) => {
  try {
    await prisma.salesRoute.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Route deleted' });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

// ─── Employee Routes ───────────────────────────────────────
export const getEmployeeRoutes = async (req: Request, res: Response) => {
  try {
    const routes = await prisma.employeeRoute.findMany({
      include: { route: { include: { city: true, area: true } }, employee: true }
    });
    res.json(routes);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const assignEmployeeRoute = async (req: Request, res: Response) => {
  try {
    const { routeId, employeeId } = req.body;
    const assignment = await prisma.employeeRoute.create({
      data: { routeId: Number(routeId), employeeId: Number(employeeId) }
    });
    res.status(201).json(assignment);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};
