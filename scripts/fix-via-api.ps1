# Fix database issues via direct database connection
$dbUrl = "postgresql://neondb_owner:npg_qmNAM1O5rnXo@ep-shy-waterfall-aif4nzy3-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require"

Write-Host "Attempting to fix database issues..." -ForegroundColor Cyan

# Install postgres client if not available
try {
    # Try using Node.js to execute SQL
    $sqlScript = @"
const postgres = require('postgres');

const sql = postgres('$dbUrl', {
    ssl: 'require'
});

async function fixDatabase() {
    try {
        console.log('Updating user roles...');
        await sql``UPDATE users SET role = 'ADMIN' WHERE email = 'admin@hrms.com'``;
        await sql``UPDATE users SET role = 'HR' WHERE email = 'hr@hrms.com'``;
        await sql``UPDATE users SET role = 'MANAGER' WHERE email = 'manager@hrms.com'``;
        
        console.log('Creating employee records...');
        await sql``
            INSERT INTO employees (user_id, created_at)
            SELECT id, created_at FROM users
            WHERE id NOT IN (SELECT user_id FROM employees)
        ``;
        
        console.log('Verifying fixes...');
        const users = await sql``SELECT email, role FROM users ORDER BY role, email``;
        console.log('Users:', users);
        
        const employees = await sql``SELECT COUNT(*) as count FROM employees``;
        console.log('Employee records:', employees[0].count);
        
        console.log('Database fixed successfully!');
    } catch (error) {
        console.error('Error:', error.message);
    } finally {
        await sql.end();
    }
}

fixDatabase();
"@

    $sqlScript | Out-File -FilePath "fix-db.js" -Encoding UTF8
    node fix-db.js
    Remove-Item "fix-db.js"
    
} catch {
    Write-Host "Could not fix via Node.js: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "Please run the SQL manually in your Neon console" -ForegroundColor Yellow
}
