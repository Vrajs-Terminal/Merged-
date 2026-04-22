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
exports.getDashboardStats = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const getDashboardStats = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const todayStr = new Date().toISOString().split('T')[0] || "";
        const todayDate = new Date(todayStr);
        // Basic Statistics & Pending Counts
        const [totalEmployees, activeEmployees, pendingLeaves, upcomingEvents, openLostFound, totalAssets, presentToday, numBranches, numDepts, pendingExpenses, overtimeRequests, deviceChanges] = yield Promise.all([
            prismaClient_1.default.employee.count(),
            prismaClient_1.default.employee.count({ where: { status: "Active" } }),
            prismaClient_1.default.leaveRequest.count({ where: { status: "Pending" } }),
            prismaClient_1.default.event.count({ where: { startDate: { gte: new Date() } } }),
            prismaClient_1.default.lostFoundItem.count({ where: { status: "Open" } }),
            prismaClient_1.default.asset.count(),
            prismaClient_1.default.attendanceLog.count({
                where: {
                    date: todayDate,
                    clockIn: { not: null },
                },
            }),
            prismaClient_1.default.branch.count(),
            prismaClient_1.default.department.count(),
            prismaClient_1.default.expenseRequest.count({ where: { status: "Pending" } }),
            prismaClient_1.default.attendanceRequest.count({ where: { request_type: "Overtime", status: "Pending" } }),
            prismaClient_1.default.deviceChangeRequest.count({ where: { status: "Pending" } })
        ]);
        // Department Split
        const deptStats = yield prismaClient_1.default.employee.groupBy({
            by: ['department'],
            _count: { id: true },
            where: { department: { not: null } }
        });
        const deptData = deptStats.map(d => ({
            name: d.department || 'Unknown',
            value: Math.round((d._count.id / (totalEmployees || 1)) * 100)
        }));
        // Recent Employees
        const recentEmployees = yield prismaClient_1.default.employee.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                department: true,
                status: true,
                createdAt: true
            }
        });
        // Recent Activities
        const recentActivitiesRaw = yield prismaClient_1.default.activityLog.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { name: true } } }
        });
        const recentActivities = recentActivitiesRaw.map(a => {
            var _a;
            return ({
                id: a.id,
                action: `${a.action} ${a.entity_type}`,
                user: ((_a = a.user) === null || _a === void 0 ? void 0 : _a.name) || 'System',
                time: new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            });
        });
        res.status(200).json({
            overview: {
                totalEmployees,
                activeEmployees,
                presentToday,
                onLeave: pendingLeaves,
                absentToday: totalEmployees - presentToday,
                pendingExpenses,
                wfhRequests: 0,
                overtimeRequests,
                deviceChanges,
                profileChanges: 0,
                bankChanges: 0,
                faceChanges: 0,
                shiftChanges: 0,
                taxDocs: 0,
                lateToday: 0,
                missingPunch: 0,
                halfDay: 0,
                pastAttendance: 0,
                shortLeaves: 0
            },
            counts: {
                branches: numBranches,
                departments: numDepts
            },
            departmentSplit: deptData,
            recentEmployees: recentEmployees.map(e => {
                const fullName = `${e.firstName || ''} ${e.lastName || ''}`.trim() || 'Worker';
                return {
                    id: e.id,
                    name: fullName,
                    initials: fullName.split(' ').map(n => n[0]).join(''),
                    dept: e.department || 'General',
                    status: e.status || 'Active',
                    statusColor: e.status === 'Active' ? '#10b981' : '#f59e0b',
                    avatarColor: '#3b82f6'
                };
            }),
            recentActivities,
            hiringTrend: [
                { month: 'Jan', hires: 4, exits: 1 },
                { month: 'Feb', hires: 6, exits: 2 },
                { month: 'Mar', hires: 8, exits: 3 },
                { month: 'Apr', hires: totalEmployees, exits: 2 }
            ],
            attendanceTrend: [
                { day: 'Mon', present: 85, late: 5 },
                { day: 'Tue', present: 88, late: 3 },
                { day: 'Wed', present: 82, late: 8 },
                { day: 'Thu', present: 90, late: 2 },
                { day: 'Fri', present: 87, late: 4 }
            ],
            totalAssets,
            upcomingEvents,
            openLostFound
        });
    }
    catch (error) {
        console.error("Dashboard Stats Error:", error);
        res.status(500).json({ message: "Server error", error });
    }
});
exports.getDashboardStats = getDashboardStats;
