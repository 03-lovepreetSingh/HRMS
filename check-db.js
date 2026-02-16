const postgres = require('postgres');

const sql = postgres(process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_qmNAM1O5rnXo@ep-shy-waterfall-aif4nzy3-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require', {
    ssl: 'require'
});

async function checkDatabase() {
    try {
        console.log('Checking database...\n');
        
        const users = await sql`SELECT id, email, role FROM users ORDER BY email`;
        console.log('Users:');
        users.forEach(u => console.log(`  ${u.email} (${u.role}) - ID: ${u.id}`));
        
        console.log('\nEmployees:');
        const employees = await sql`
            SELECT e.id, e.user_id, u.email, e.department_id, e.designation_id
            FROM employees e
            JOIN users u ON e.user_id = u.id
            ORDER BY u.email
        `;
        employees.forEach(e => console.log(`  ${e.email} - Emp ID: ${e.id}, User ID: ${e.user_id}`));
        
        console.log(`\nTotal: ${users.length} users, ${employees.length} employees`);
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await sql.end();
    }
}

checkDatabase();
