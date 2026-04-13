const fs = require('fs');
const mysql = require('mysql2/promise');

async function importSql() {
    console.log('Connecting to TiDB Cloud...');
    const conn = await mysql.createConnection({
        host: 'gateway01.ap-southeast-1.prod.aws.tidbcloud.com',
        port: 4000,
        user: '3PSCgxFCtHyhRht.root',
        password: 'xT8bypUzLczbNJXc',
        database: 'test',
        ssl: { rejectUnauthorized: true },
        multipleStatements: true
    });
    console.log('Connected!');

    try {
        // 1. Drop all tables one by one
        console.log('Dropping existing tables...');
        await conn.query('SET FOREIGN_KEY_CHECKS = 0;');
        const [tables] = await conn.query("SELECT CONCAT('DROP TABLE IF EXISTS `', table_name, '`;') AS stmt FROM information_schema.tables WHERE table_schema = 'test';");

        for (const row of tables) {
            await conn.query(row.stmt);
        }
        console.log(`Dropped ${tables.length} tables.`);
        await conn.query('SET FOREIGN_KEY_CHECKS = 1;');

        // 2. Create the tables natively via Prisma schema SQL
        console.log('Reading schema.sql...');
        const schemaSql = fs.readFileSync('schema.sql', 'utf8');
        const schemaStatements = schemaSql.split(';').filter(s => s.trim().length > 0);

        console.log('Creating tables...');
        for (const stmt of schemaStatements) {
            if (stmt.trim()) {
                await conn.query(stmt);
            }
        }

        // 3. Extract and run only INSERT INTO statements from the dump
        // 3. Extract and run only INSERT INTO statements from the dump
        console.log('Reading minehr_db.sql for data...');
        const dumpSql = fs.readFileSync('../minehr_db.sql', 'utf8');
        const dumpStatements = dumpSql.split(';');
        const insertStmts = dumpStatements
            .map(stmt => stmt.replace(/^--.*$/gm, '').trim())
            .filter(stmt => stmt.startsWith('INSERT INTO'));

        console.log(`Executing ${insertStmts.length} data insertion statements...`);
        await conn.query('SET FOREIGN_KEY_CHECKS = 0;');
        for (const stmt of insertStmts) {
            await conn.query(stmt);
        }
        await conn.query('SET FOREIGN_KEY_CHECKS = 1;');

        console.log('✅ Schema and Data Import completed successfully!');
    } catch (e) {
        console.log('❌ ERROR:', e.message);
    } finally {
        await conn.end();
    }
}

importSql();
