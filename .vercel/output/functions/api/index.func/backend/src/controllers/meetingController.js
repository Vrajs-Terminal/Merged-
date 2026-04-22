"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateMeetingSettings = exports.getMeetingSettings = exports.getMeetingReports = exports.updateActionItem = exports.getActionItems = exports.saveMOM = exports.markAttendance = exports.updateMeetingStatus = exports.getMeetingById = exports.getMeetings = exports.createMeeting = void 0;
const prismaClient_1 = __importDefault(require("../lib/prismaClient"));
const activityLogger_1 = require("../services/activityLogger");
const createMeeting = async (req, res) => {
    var _a;
    try {
        const { title, description, meeting_type, meeting_date, start_time, end_time, organizer_id, location, meeting_link, priority, reminder_before, participants, // Array of user IDs
        attachments // Array of { name, file_url }
         } = req.body;
        const meeting = await prismaClient_1.default.meeting.create({
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
        await (0, activityLogger_1.logActivity)(((_a = req.user) === null || _a === void 0 ? void 0 : _a.id) || organizer_id, 'CREATED', 'MEETING', title);
        res.status(201).json(meeting);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create meeting', details: error.message });
    }
};
exports.createMeeting = createMeeting;
const getMeetings = async (req, res) => {
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
        const meetings = await prismaClient_1.default.meeting.findMany({
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
};
exports.getMeetings = getMeetings;
const getMeetingById = async (req, res) => {
    try {
        const { id } = req.params;
        const meeting = await prismaClient_1.default.meeting.findUnique({
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
};
exports.getMeetingById = getMeetingById;
const updateMeetingStatus = async (req, res) => {
    var _a;
    try {
        const { id } = req.params;
        const { status } = req.body;
        const meeting = await prismaClient_1.default.meeting.update({
            where: { id: parseInt(id) },
            data: { status }
        });
        await (0, activityLogger_1.logActivity)((_a = req.user) === null || _a === void 0 ? void 0 : _a.id, 'UPDATED', 'MEETING', `Status to ${status} for meeting #${id}`);
        res.json(meeting);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update meeting status', details: error.message });
    }
};
exports.updateMeetingStatus = updateMeetingStatus;
const markAttendance = async (req, res) => {
    try {
        const { meetingId, userId } = req.params;
        const { status, join_time, leave_time } = req.body;
        const participant = await prismaClient_1.default.meetingParticipant.update({
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
};
exports.markAttendance = markAttendance;
const saveMOM = async (req, res) => {
    var _a;
    try {
        const { meeting_id, discussion_points, decisions, action_items } = req.body;
        // Use transaction to save MOM and Action Items
        const result = await prismaClient_1.default.$transaction(async (tx) => {
            const mom = await tx.meetingMOM.upsert({
                where: { meeting_id: parseInt(meeting_id) },
                update: { discussion_points, decisions },
                create: { meeting_id: parseInt(meeting_id), discussion_points, decisions }
            });
            if (action_items && Array.isArray(action_items)) {
                await tx.meetingActionItem.createMany({
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
            await tx.meeting.update({
                where: { id: parseInt(meeting_id) },
                data: { status: 'Completed' }
            });
            return mom;
        });
        await (0, activityLogger_1.logActivity)((_a = req.user) === null || _a === void 0 ? void 0 : _a.id, 'CREATED', 'MOM', `For meeting #${meeting_id}`);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to save MOM', details: error.message });
    }
};
exports.saveMOM = saveMOM;
const getActionItems = async (req, res) => {
    try {
        const { user_id, status } = req.query;
        const where = {};
        if (user_id)
            where.assigned_to = parseInt(user_id);
        if (status)
            where.status = status;
        const items = await prismaClient_1.default.meetingActionItem.findMany({
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
};
exports.getActionItems = getActionItems;
const updateActionItem = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const item = await prismaClient_1.default.meetingActionItem.update({
            where: { id: parseInt(id) },
            data: { status }
        });
        res.json(item);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update action item', details: error.message });
    }
};
exports.updateActionItem = updateActionItem;
const getMeetingReports = async (req, res) => {
    try {
        const totalMeetings = await prismaClient_1.default.meeting.count();
        const statusCounts = await prismaClient_1.default.meeting.groupBy({
            by: ['status'],
            _count: true
        });
        const attendanceStats = await prismaClient_1.default.meetingParticipant.groupBy({
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
};
exports.getMeetingReports = getMeetingReports;
const getMeetingSettings = async (req, res) => {
    try {
        const settings = await prismaClient_1.default.meetingSetting.findMany();
        res.json(settings);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch settings', details: error.message });
    }
};
exports.getMeetingSettings = getMeetingSettings;
const updateMeetingSettings = async (req, res) => {
    try {
        const { key, value } = req.body;
        const setting = await prismaClient_1.default.meetingSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });
        res.json(setting);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update settings', details: error.message });
    }
};
exports.updateMeetingSettings = updateMeetingSettings;
//# sourceMappingURL=meetingController.js.map