const postgres = require('postgres');

const sql = postgres(process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_qmNAM1O5rnXo@ep-shy-waterfall-aif4nzy3-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require', {
    ssl: 'require'
});

async function checkAttendance() {
    try {
        console.log('Checking attendance records...\n');
        
        const attendance = await sql`
            SELECT a.id, a.employee_id, a.date, a.punch_in, a.punch_out, u.email
            FROM attendance a
            JOIN employees e ON a.employee_id = e.id
            JOIN users u ON e.user_id = u.id
            ORDER BY a.date DESC, a.punch_in DESC
            LIMIT 20
        `;
        
        console.log('Recent Attendance Records:');
        if (attendance.length === 0) {
            console.log('  No attendance records found');
        } else {
            attendance.forEach(a => {
                console.log(`  ${a.email} - Date: ${a.date}, In: ${a.punch_in}, Out: ${a.punch_out || 'Not punched out'}`);
            });
        }
        
        console.log('\nDeleting all attendance records to allow fresh punch-in...');
        const result = await sql`DELETE FROM attendance`;
        console.log(`Deleted ${result.count} attendance records`);
        
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await sql.end();
    }
}

checkAttendance();
