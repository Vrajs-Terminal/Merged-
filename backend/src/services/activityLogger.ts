import prisma from '../lib/prismaClient';

export async function logActivity(
    userId: number | null,
    action: string,
    entityType: string,
    entityName: string,
    details?: Record<string, any>
) {
    try {
        await prisma.activityLog.create({
            data: {
                user_id: userId,
                action,
                entity_type: entityType,
                entity_name: entityName,
                details: details ? JSON.stringify(details) : null
            }
        });
    } catch (error) {
        console.error('Failed to log activity:', error);
    }
}
