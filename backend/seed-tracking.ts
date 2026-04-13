import { PrismaClient } from '@prisma/client';
declare let process: any;
const prisma = new PrismaClient();

async function seed() {
    console.log('🌱 Seeding Employee Tracking data...');

    // 1. Geofences
    const geofences = [
        { name: 'Mumbai Head Office', latitude: '19.0760', longitude: '72.8777', radius: 200, status: 'Active', punchRule: 'inside_only', employeeCount: 85 },
        { name: 'Pune Branch Office', latitude: '18.5204', longitude: '73.8567', radius: 150, status: 'Active', punchRule: 'inside_only', employeeCount: 42 },
        { name: 'Delhi Regional Office', latitude: '28.7041', longitude: '77.1025', radius: 300, status: 'Active', punchRule: 'outside_with_reason', employeeCount: 28 },
        { name: 'Warehouse Navi Mumbai', latitude: '19.0330', longitude: '73.0297', radius: 500, status: 'Inactive', punchRule: 'outside_with_reason', employeeCount: 12 },
        { name: 'Client Site - BKC', latitude: '19.0658', longitude: '72.8694', radius: 100, status: 'Active', punchRule: 'outside_with_reason', employeeCount: 0 },
    ];

    for (const gf of geofences) {
        await prisma.geofence.upsert({
            where: { id: geofences.indexOf(gf) + 1 },
            update: gf,
            create: gf
        });
    }
    console.log(`  ✅ ${geofences.length} geofences seeded`);

    // 2. Get existing users
    const users = await prisma.user.findMany({ take: 10, select: { id: true, name: true } });
    if (users.length === 0) {
        console.log('  ⚠️  No users found, skipping user-dependent seeds');
        await prisma.$disconnect();
        return;
    }
    console.log(`  📋 Found ${users.length} users`);

    // 3. Tracking Configs
    for (const user of users) {
        await prisma.trackingConfig.upsert({
            where: { user_id: user.id },
            update: {},
            create: {
                user_id: user.id,
                enabled: Math.random() > 0.2,
                frequency: [5, 10, 15, 30][Math.floor(Math.random() * 4)],
                workingHoursOnly: Math.random() > 0.3
            }
        });
    }
    console.log(`  ✅ ${users.length} tracking configs seeded`);

    // 4. Tracking Logs (today + past 7 days)
    const statuses = ['Working', 'Working', 'Working', 'Break', 'Field Visit', 'Offline'];
    const locations = [
        'Mumbai Head Office', 'Pune Branch Office', 'Delhi Regional Office',
        'Client Site - Andheri', 'Client Site - BKC', 'Warehouse Navi Mumbai',
        'Cafeteria', 'Thane Branch', 'Mumbai Office - Floor 3'
    ];

    const now = new Date();
    let logCount = 0;

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        for (const user of users) {
            const numLogs = 3 + Math.floor(Math.random() * 5);
            for (let i = 0; i < numLogs; i++) {
                const timestamp = new Date(now);
                timestamp.setDate(timestamp.getDate() - dayOffset);
                timestamp.setHours(8 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60), 0);

                await prisma.trackingLog.create({
                    data: {
                        user_id: user.id,
                        latitude: (19.0 + Math.random() * 0.1).toFixed(4),
                        longitude: (72.8 + Math.random() * 0.1).toFixed(4),
                        location: locations[Math.floor(Math.random() * locations.length)],
                        status: statuses[Math.floor(Math.random() * statuses.length)],
                        batteryLevel: 20 + Math.floor(Math.random() * 80),
                        timestamp
                    }
                });
                logCount++;
            }
        }
    }
    console.log(`  ✅ ${logCount} tracking logs seeded`);

    // 5. Tracking Exceptions
    const exTypes = ['Late Punch', 'Geofence Violation', 'GPS Off', 'Internet Off', 'Unauthorized Movement'];
    const severities = ['Low', 'Medium', 'High', 'Critical'];
    const exStatuses = ['Pending', 'Pending', 'Approved', 'Rejected'];
    const descriptions = [
        'Employee punched in 45 minutes late',
        'Employee detected 500m outside office geofence',
        'GPS signal lost for 2 hours during working hours',
        'Internet disconnected during field visit',
        'Unauthorized location detected outside approved zone',
        'Employee left geofence without approval',
        'Late arrival - no prior notification',
        'GPS turned off manually during shift'
    ];

    let exCount = 0;
    for (let i = 0; i < 20; i++) {
        const user = users[Math.floor(Math.random() * users.length)];
        const statusVal = exStatuses[Math.floor(Math.random() * exStatuses.length)];
        const createdAt = new Date(now);
        createdAt.setDate(createdAt.getDate() - Math.floor(Math.random() * 14));
        createdAt.setHours(8 + Math.floor(Math.random() * 10));

        await prisma.trackingException.create({
            data: {
                user_id: user.id,
                type: exTypes[Math.floor(Math.random() * exTypes.length)],
                severity: severities[Math.floor(Math.random() * severities.length)],
                description: descriptions[Math.floor(Math.random() * descriptions.length)],
                status: statusVal,
                resolvedAt: statusVal !== 'Pending' ? new Date(createdAt.getTime() + 3600000) : null,
                createdAt
            }
        });
        exCount++;
    }
    console.log(`  ✅ ${exCount} tracking exceptions seeded`);

    console.log('\n🎉 Employee Tracking seed complete!');
    await prisma.$disconnect();
}

seed().catch(e => {
    console.error('Seed failed:', e);
    process.exit(1);
});
