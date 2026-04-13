import { Request, Response } from 'express';
import prisma from '../lib/prismaClient';
import { logActivity } from '../services/activityLogger';

export const createMeeting = async (req: Request, res: Response) => {
    try {
        const {
            title,
            description,
            meeting_type,
            meeting_date,
            start_time,
            end_time,
            organizer_id,
            location,
            meeting_link,
            priority,
            reminder_before,
            participants, // Array of user IDs
            attachments // Array of { name, file_url }
        } = req.body;

        const meeting = await prisma.meeting.create({
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
                    create: participants.map((userId: number) => ({
                        user_id: userId
                    }))
                },
                attachments: {
                    create: attachments?.map((att: any) => ({
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

        await logActivity((req as any).user?.id || organizer_id, 'CREATED', 'MEETING', title);
        res.status(201).json(meeting);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to create meeting', details: error.message });
    }
};

export const getMeetings = async (req: Request, res: Response) => {
    try {
        const { status, date_from, date_to, organizer_id } = req.query as any;

        const where: any = {};
        if (status) where.status = status;
        if (organizer_id) where.organizer_id = parseInt(organizer_id as string);
        if (date_from || date_to) {
            where.meeting_date = {};
            if (date_from) where.meeting_date.gte = new Date(date_from as string);
            if (date_to) where.meeting_date.lte = new Date(date_to as string);
        }

        const meetings = await prisma.meeting.findMany({
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
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch meetings', details: error.message });
    }
};

export const getMeetingById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const meeting = await prisma.meeting.findUnique({
            where: { id: parseInt(id as string) },
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

        if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
        res.json(meeting);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch meeting details', details: error.message });
    }
};

export const updateMeetingStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const meeting = await prisma.meeting.update({
            where: { id: parseInt(id as string) },
            data: { status }
        });

        await logActivity((req as any).user?.id, 'UPDATED', 'MEETING', `Status to ${status} for meeting #${id}`);
        res.json(meeting);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to update meeting status', details: error.message });
    }
};

export const markAttendance = async (req: Request, res: Response) => {
    try {
        const { meetingId, userId } = req.params;
        const { status, join_time, leave_time } = req.body;

        const participant = await prisma.meetingParticipant.update({
            where: {
                meeting_id_user_id: {
                    meeting_id: parseInt(meetingId as string),
                    user_id: parseInt(userId as string)
                }
            },
            data: {
                attendance_status: status,
                join_time: join_time ? new Date(join_time) : undefined,
                leave_time: leave_time ? new Date(leave_time) : undefined
            }
        });

        res.json(participant);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to mark attendance', details: error.message });
    }
};

export const saveMOM = async (req: Request, res: Response) => {
    try {
        const { meeting_id, discussion_points, decisions, action_items } = req.body;

        // Use transaction to save MOM and Action Items
        const result = await prisma.$transaction(async (tx) => {
            const mom = await tx.meetingMOM.upsert({
                where: { meeting_id: parseInt(meeting_id as string) },
                update: { discussion_points, decisions },
                create: { meeting_id: parseInt(meeting_id as string), discussion_points, decisions }
            });

            if (action_items && Array.isArray(action_items)) {
                await tx.meetingActionItem.createMany({
                    data: action_items.map((item: any) => ({
                        meeting_id: parseInt(meeting_id as string),
                        assigned_to: parseInt(item.assigned_to),
                        description: item.description,
                        deadline: item.deadline ? new Date(item.deadline) : null,
                        status: 'Pending'
                    }))
                });
            }

            // Mark meeting as completed when MOM is saved
            await tx.meeting.update({
                where: { id: parseInt(meeting_id as string) },
                data: { status: 'Completed' }
            });

            return mom;
        });

        await logActivity((req as any).user?.id, 'CREATED', 'MOM', `For meeting #${meeting_id}`);
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to save MOM', details: error.message });
    }
};

export const getActionItems = async (req: Request, res: Response) => {
    try {
        const { user_id, status } = req.query as any;
        const where: any = {};
        if (user_id) where.assigned_to = parseInt(user_id as string);
        if (status) where.status = status;

        const items = await prisma.meetingActionItem.findMany({
            where,
            include: {
                meeting: { select: { title: true, meeting_date: true } },
                assignee: { select: { name: true } }
            },
            orderBy: { deadline: 'asc' }
        });

        res.json(items);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch action items', details: error.message });
    }
};

export const updateActionItem = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const item = await prisma.meetingActionItem.update({
            where: { id: parseInt(id as string) },
            data: { status }
        });

        res.json(item);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to update action item', details: error.message });
    }
};

export const getMeetingReports = async (req: Request, res: Response) => {
    try {
        const totalMeetings = await prisma.meeting.count();
        const statusCounts = await prisma.meeting.groupBy({
            by: ['status'],
            _count: true
        });

        const attendanceStats = await prisma.meetingParticipant.groupBy({
            by: ['attendance_status'],
            _count: true
        });

        res.json({
            totalMeetings,
            statusCounts,
            attendanceStats
        });
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch reports', details: error.message });
    }
};

export const getMeetingSettings = async (req: Request, res: Response) => {
    try {
        const settings = await prisma.meetingSetting.findMany();
        res.json(settings);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to fetch settings', details: error.message });
    }
};

export const updateMeetingSettings = async (req: Request, res: Response) => {
    try {
        const { key, value } = req.body;
        const setting = await prisma.meetingSetting.upsert({
            where: { key },
            update: { value },
            create: { key, value }
        });
        res.json(setting);
    } catch (error: any) {
        res.status(500).json({ error: 'Failed to update settings', details: error.message });
    }
};
