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
exports.updateMeetingSettings = exports.getMeetingSettings = exports.getMeetingReports = exports.updateActionItem = exports.getActionItems = exports.saveMOM = exports.markAttendance = exports.updateMeetingStatus = exports.getMeetingById = exports.getMeetings = exports.createMeeting = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const activityLogger_1 = require("../services/activityLogger");
const createMeeting = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { title, description, meeting_type, meeting_date, start_time, end_time, organizer_id, location, meeting_link, priority, reminder_before, participants, // Array of user IDs
        attachments // Array of { name, file_url }
         } = req.body;
        const meeting = yield prismaClient_1.default.meeting.create({
            data: {
                title,
                description,
                meeting_type,
                meeting_date: new Date(meeting_date),
                start_time,
                end_time,
                organizer_id: parseInt(organizer_id),
                location,
                meeting_link,
                priority,
                reminder_before: reminder_before ? parseInt(reminder_before) : 30,
                participants: {
                    create: participants.map((userId) => ({
                        user_id: userId
                    }))
                },
                attachments: {
                    create: attachments === null || attachments === void 0 ? void 0 : attachments.map((att) => ({
                        name: att.name,
                        file_url: att.file_url,
                        file_type: att.file_type
                    }))
                }
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: { name: true, email: true }
                        }
                    }
                }
            }
        });
        yield (0, activityLogger_1.logActivity)(((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || organizer_id, 'CREATED', 'MEETING', title);
        res.status(201).json(meeting);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create meeting', details: error.message });
    }
});
exports.createMeeting = createMeeting;
const getMeetings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status, date_from, date_to, organizer_id } = req.query;
        const where = {};
        if (status)
            where.status = status;
        if (organizer_id)
            where.organizer_id = parseInt(organizer_id);
        if (date_from || date_to) {
            where.meeting_date = {};
            if (date_from)
                where.meeting_date.gte = new Date(date_from);
            if (date_to)
                where.meeting_date.lte = new Date(date_to);
        }
        const meetings = yield prismaClient_1.default.meeting.findMany({
            where,
            include: {
                organizer: { select: { name: true } },
                participants: {
                    include: {
                        user: { select: { name: true, email: true } }
                    }
                },
                _count: {
                    select: { participants: true }
                }
            },
            orderBy: { meeting_date: 'desc' }
        });
        res.json(meetings);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch meetings', details: error.message });
    }
});
exports.getMeetings = getMeetings;
const getMeetingById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const meeting = yield prismaClient_1.default.meeting.findUnique({
            where: { id: parseInt(id) },
            include: {
                organizer: { select: { name: true } },
                participants: {
                    include: {
                        user: { select: { name: true, email: true } }
                    }
                },
                attachments: true,
                mom: true,
                actionItems: {
                    include: {
                        assignee: { select: { name: true } }
                    }
                }
            }
        });
        if (!meeting)
            return res.status(404).json({ error: 'Meeting not found' });
        res.json(meeting);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch meeting details', details: error.message });
    }
});
exports.getMeetingById = getMeetingById;
const updateMeetingStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { status } = req.body;
        const meeting = yield prismaClient_1.default.meeting.update({
            where: { id: parseInt(id) },
            data: { status }
        });
        yield (0, activityLogger_1.logActivity)((_a = req.user) === null || _a === void 0 ? void 0 : _a.id, 'UPDATED', 'MEETING', `Status to ${status} for meeting #${id}`);
        res.json(meeting);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update meeting status', details: error.message });
    }
});
exports.updateMeetingStatus = updateMeetingStatus;
const markAttendance = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { meetingId, userId } = req.params;
        const { status, join_time, leave_time } = req.body;
        const participant = yield prismaClient_1.default.meetingParticipant.update({
            where: {
                meeting_id_user_id: {
                    meeting_id: parseInt(meetingId),
                    user_id: parseInt(userId)
                }
            },
            data: {
                attendance_status: status,
                join_time: join_time ? new Date(join_time) : undefined,
                leave_time: leave_time ? new Date(leave_time) : undefined
            }
        });
        res.json(participant);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to mark attendance', details: error.message });
    }
});
exports.markAttendance = markAttendance;
const saveMOM = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { meeting_id, discussion_points, decisions, action_items } = req.body;
        // Use transaction to save MOM and Action Items
        const result = yield prismaClient_1.default.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const mom = yield tx.meetingMOM.upsert({
                where: { meeting_id: parseInt(meeting_id) },
                update: { discussion_points, decisions },
                create: { meeting_id: parseInt(meeting_id), discussion_points, decisions }
            });
            if (action_items && Array.isArray(action_items)) {
                yield tx.meetingActionItem.createMany({
                    data: action_items.map((item) => ({
                        meeting_id: parseInt(meeting_id),
                        assigned_to: parseInt(item.assigned_to),
                        description: item.description,
                        deadline: item.deadline ? new Date(item.deadline) : null,
                        status: 'Pending'
                    }))
                });
            }
            // Mark meeting as completed when MOM is saved
            yield tx.meeting.update({
                where: { id: parseInt(meeting_id) },
                data: { status: 'Completed' }
            });
            return mom;
        }));
        yield (0, activityLogger_1.logActivity)((_a = req.user) === null || _a === void 0 ? void 0 : _a.id, 'CREATED', 'MOM', `For meeting #${meeting_id}`);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to save MOM', details: error.message });
    }
});
exports.saveMOM = saveMOM;
const getActionItems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id, status } = req.query;
        const where = {};
        if (user_id)
            where.assigned_to = parseInt(user_id);
        if (status)
            where.status = status;
        const items = yield prismaClient_1.default.meetingActionItem.findMany({
            where,
            include: {
                meeting: { select: { title: true, meeting_date: true } },
                assignee: { select: { name: true } }
            },
            orderBy: { deadline: 'asc' }
        });
        res.json(items);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch action items', details: error.message });
    }
});
exports.getActionItems = getActionItems;
const updateActionItem = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const item = yield prismaClient_1.default.meetingActionItem.update({
            where: { id: parseInt(id) },
            data: { status }
        });
        res.json(item);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update action item', details: error.message });
    }
});
exports.updateActionItem = updateActionItem;
const getMeetingReports = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalMeetings = yield prismaClient_1.default.meeting.count();
        const statusCounts = yield prismaClient_1.default.meeting.groupBy({
            by: ['status'],
            _count: true
        });
        const attendanceStats = yield prismaClient_1.default.meetingParticipant.groupBy({
            by: ['attendance_status'],
            _count: true
        });
        res.json({
            totalMeetings,
            statusCounts,
            attendanceStats
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch reports', details: error.message });
    }
});
exports.getMeetingReports = getMeetingReports;
const getMeetingSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const settings = yield prismaClient_1.default.meetingSetting.findMany();
        res.json(settings);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch settings', details: error.message });
    }
});
exports.getMeetingSettings = getMeetingSettings;
const updateMeetingSettings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { key, value } = req.body;
        const setting = yield prismaClient_1.default.meetingSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });
        res.json(setting);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update settings', details: error.message });
    }
});
exports.updateMeetingSettings = updateMeetingSettings;
