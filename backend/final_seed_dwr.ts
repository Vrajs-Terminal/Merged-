import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Final Seeding for Daily Work Reports (100% Complete Module)...');

    // Get departments and designations
    const departments = await prisma.department.findMany();
    const designations = await prisma.designation.findMany();

    if (departments.length === 0 || designations.length === 0) {
        console.log('Departments or Designations missing. Please seed them first.');
        return;
    }

    // Assign designations to users if missing
    const users = await prisma.user.findMany({ take: 10 });
    for (let i = 0; i < users.length; i++) {
        await prisma.user.update({
            where: { id: users[i].id },
            data: {
                designation_id: designations[i % designations.length].id,
                department_id: departments[i % departments.length].id
            }
        });
    }

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    // Clear existing for these users
    const userIds = users.map(u => u.id);
    await (prisma as any).dailyWork.deleteMany({
        where: { user_id: { in: userIds } }
    });

    const locations = ['Office Main Gate', 'Client Site A', 'Central Mall', 'Industrial Hub', 'Warehouse 4'];
    const workTypes = ['Office', 'Field'];

    for (const user of users) {
        // Create today's report
        await (prisma as any).dailyWork.create({
            data: {
                user: { connect: { id: user.id } },
                work_date: today,
                check_in_time: new Date(new Date().setHours(9, 0, 0, 0)),
                check_out_time: new Date(new Date().setHours(18, 0, 0, 0)),
                total_work_hours: 9.0,
                total_distance: Math.random() * 15 + 5,
                tasks_completed: Math.floor(Math.random() * 5) + 3,
                work_type: workTypes[Math.floor(Math.random() * 2)],
                status: 'Pending',
                activities: {
                    create: [
                        {
                            activity_type: 'Check-in',
                            activity_time: new Date(new Date().setHours(9, 0, 0, 0)),
                            location: locations[0],
                            latitude: "28.6139",
                            longitude: "77.2090"
                        },
                        {
                            activity_type: 'Client Visit',
                            activity_time: new Date(new Date().setHours(11, 0, 0, 0)),
                            location: locations[1],
                            latitude: "28.6200",
                            longitude: "77.2100",
                            notes: 'Discussed project scope'
                        }
                    ]
                }
            }
        });

        // Create yesterday's report
        await (prisma as any).dailyWork.create({
            data: {
                user: { connect: { id: user.id } },
                work_date: yesterday,
                check_in_time: new Date(new Date(yesterday).setHours(9, 30, 0, 0)),
                check_out_time: new Date(new Date(yesterday).setHours(17, 30, 0, 0)),
                total_work_hours: 8.0,
                total_distance: Math.random() * 10,
                tasks_completed: 4,
                work_type: 'Field',
                status: 'Approved',
                admin_remark: 'Good field coverage.',
                activities: {
                    create: [
                        {
                            activity_type: 'Check-in',
                            activity_time: new Date(new Date(yesterday).setHours(9, 30, 0, 0)),
                            location: locations[0]
                        },
                        {
                            activity_type: 'Field Visit',
                            activity_time: new Date(new Date(yesterday).setHours(14, 0, 0, 0)),
                            location: locations[4]
                        }
                    ]
                }
            }
        });
    }

    console.log('100% Complete Module Seeding Finished.');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
