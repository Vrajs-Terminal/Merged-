import prisma from '../lib/prismaClient';

/**
 * CelebrationService: Automated Post Generation (Submodule 2)
 * Scans for Birthdays, Work Anniversaries, and Wedding Anniversaries.
 */
export const runDailyCelebrations = async () => {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();

    try {
        // 1. Fetch Users with Birthdays Today
        const birthdayUsers = await prisma.user.findMany({
            where: {
                dob: { not: null }
            }
        });

        const builders: any[] = [];

        for (const user of birthdayUsers) {
            const dob = new Date(user.dob!);
            if (dob.getMonth() + 1 === month && dob.getDate() === day) {
                builders.push(createCelebrationPost(user, 'Birthday'));
            }
        }

        // 2. Fetch Users with Work Anniversaries Today
        const anniversaryUsers = await prisma.user.findMany({
            where: {
                join_date_user: { not: null }
            }
        });

        for (const user of anniversaryUsers) {
            const joinDate = new Date(user.join_date_user!);
            if (joinDate.getMonth() + 1 === month && joinDate.getDate() === day && joinDate.getFullYear() < today.getFullYear()) {
                builders.push(createCelebrationPost(user, 'WorkAnniversary'));
            }
        }

        // 3. Wedding Anniversaries
        // (Similar logic for wedding_anniversary field)

        await Promise.all(builders);
        console.log(`[CelebrationService] Successfully processed ${builders.length} celebration posts for ${today.toDateString()}`);

    } catch (error: any) {
        console.error('[CelebrationService] Error running daily scan:', error.message);
    }
};

const createCelebrationPost = async (user: any, type: string) => {
    // Attempt to find an active template for this type
    const template = await prisma.timelineTemplate.findFirst({
        where: { type, is_active: true }
    });

    const caption = type === 'Birthday' 
        ? `Wishing a very Happy Birthday to ${user.name}! 🎂 🎉`
        : `Congratulations to ${user.name} on their work anniversary! 🎊 ✨`;

    // Check if post already exists for today to avoid duplicates
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const exists = await prisma.timelinePost.findFirst({
        where: {
            author_id: user.id, // we attribute it to the user or a system-admin user ID
            type,
            createdAt: { gte: todayStart }
        }
    });

    if (exists) return;

    return prisma.timelinePost.create({
        data: {
            author_id: user.id, // Or a central 'System' user ID if available
            type,
            content: caption,
            image_url: template?.bg_image || null,
            is_system_generated: true,
            status: 'Approved',
            audience_type: 'All'
        }
    });
};
