// Fix database issues
const postgres = require('postgres');

const sql = postgres(process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_qmNAM1O5rnXo@ep-shy-waterfall-aif4nzy3-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require', {
    ssl: 'require'
});

async function fixDatabase() {
    try {
        console.log('🔧 Fixing database issues...\n');
        
        // Update user roles
        console.log('1. Updating user roles...');
        await sql`UPDATE users SET role = 'ADMIN' WHERE email = 'admin@hrms.com'`;
        await sql`UPDATE users SET role = 'HR' WHERE email = 'hr@hrms.com'`;
        await sql`UPDATE users SET role = 'MANAGER' WHERE email = 'manager@hrms.com'`;
        console.log('   ✓ Roles updated\n');
        
        // Create employee records
        console.log('2. Creating employee records...');
        const inserted = await sql`
            INSERT INTO employees (user_id, created_at)
            SELECT id, created_at FROM users
            WHERE id NOT IN (SELECT user_id FROM employees)
            RETURNING id
        `;
        console.log(`   ✓ Created ${inserted.length} employee records\n`);
        
        // Verify
        console.log('3. Verifying fixes...');
        const users = await sql`SELECT email, role FROM users ORDER BY role, email`;
        console.log('   Users:');
        users.forEach(u => console.log(`     - ${u.email}: ${u.role}`));
        
        const empCount = await sql`SELECT COUNT(*) as count FROM employees`;
        console.log(`\n   Total employees: ${empCount[0].count}`);
        
        console.log('\n✅ Database fixed successfully!');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await sql.end();
    }
}

fixDatabase();
