# PostgreSQL Database Verification Commands

## Connect to Database

```powershell
# Connect to PostgreSQL (replace 'your_user' with your PostgreSQL username)
psql -U your_user -d spectron

# Or if you need to specify host and port:
psql -U your_user -h localhost -p 5432 -d spectron
```

## Once Connected to psql

### 1. Check Database Connection
```sql
-- Show current database and user
SELECT current_database(), current_user;

-- Show PostgreSQL version
SELECT version();
```

### 2. List All Tables
```sql
-- List all tables in the database
\dt

-- Or get more details about tables
\dt+

-- Or use SQL query
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### 3. Show Table Structure
```sql
-- Show structure of a specific table
\d accounts
\d users
\d controllers
\d sensors
\d sensor_readings
\d sensor_groups
\d sensor_configurations
\d alerts
\d account_memberships

-- Or show all table structures at once
\d+
```

### 4. Count Rows in Each Table
```sql
-- Count rows in all tables
SELECT 
    schemaname,
    tablename,
    n_tup_ins as "rows"
FROM pg_stat_user_tables
ORDER BY tablename;

-- Or count manually for each table
SELECT 'accounts' as table_name, COUNT(*) as row_count FROM accounts
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'account_memberships', COUNT(*) FROM account_memberships
UNION ALL
SELECT 'controllers', COUNT(*) FROM controllers
UNION ALL
SELECT 'sensors', COUNT(*) FROM sensors
UNION ALL
SELECT 'sensor_readings', COUNT(*) FROM sensor_readings
UNION ALL
SELECT 'sensor_groups', COUNT(*) FROM sensor_groups
UNION ALL
SELECT 'sensor_configurations', COUNT(*) FROM sensor_configurations
UNION ALL
SELECT 'alerts', COUNT(*) FROM alerts;
```

### 5. View All Data in Tables

#### Accounts Table
```sql
SELECT * FROM accounts;
```

#### Users Table
```sql
-- View all users (password hash is shown, but it's hashed)
SELECT id, email, phone, created_at FROM users;

-- Or see full details
SELECT * FROM users;
```

#### Account Memberships
```sql
SELECT 
    u.email,
    a.name as account_name,
    am.role,
    am.account_id,
    am.user_id
FROM account_memberships am
JOIN users u ON am.user_id = u.id
JOIN accounts a ON am.account_id = a.id;
```

#### Controllers
```sql
SELECT * FROM controllers;

-- With account name
SELECT 
    c.id,
    c.hw_id,
    c.name,
    c.purpose,
    c.location,
    c.status,
    c.last_seen,
    a.name as account_name
FROM controllers c
JOIN accounts a ON c.account_id = a.id;
```

#### Sensors
```sql
SELECT * FROM sensors;

-- With controller and account info
SELECT 
    s.id,
    s.hw_id,
    s.type,
    s.name,
    s.purpose,
    s.unit,
    s.status,
    c.name as controller_name,
    a.name as account_name
FROM sensors s
JOIN controllers c ON s.controller_id = c.id
JOIN accounts a ON c.account_id = a.id;
```

#### Sensor Readings
```sql
-- View recent readings (last 10)
SELECT * FROM sensor_readings 
ORDER BY time DESC 
LIMIT 10;

-- Count total readings
SELECT COUNT(*) as total_readings FROM sensor_readings;

-- Readings by sensor
SELECT 
    s.name as sensor_name,
    COUNT(*) as reading_count,
    MIN(sr.time) as first_reading,
    MAX(sr.time) as last_reading
FROM sensor_readings sr
JOIN sensors s ON sr.sensor_id = s.id
GROUP BY s.id, s.name
ORDER BY reading_count DESC;
```

#### Sensor Groups
```sql
SELECT * FROM sensor_groups;

-- With sensor count
SELECT 
    sg.id,
    sg.name,
    sg.purpose,
    COUNT(sgs.sensor_id) as sensor_count
FROM sensor_groups sg
LEFT JOIN sensor_group_sensors sgs ON sg.id = sgs.group_id
GROUP BY sg.id, sg.name, sg.purpose;
```

#### Sensor Configurations
```sql
SELECT * FROM sensor_configurations;

-- With sensor name
SELECT 
    sc.*,
    s.name as sensor_name,
    s.type as sensor_type
FROM sensor_configurations sc
JOIN sensors s ON sc.sensor_id = s.id;
```

#### Alerts
```sql
SELECT * FROM alerts ORDER BY created_at DESC;

-- With sensor and account info
SELECT 
    a.id,
    a.type,
    a.message,
    a.severity,
    a.acknowledged_at,
    a.created_at,
    s.name as sensor_name,
    acc.name as account_name
FROM alerts a
JOIN sensors s ON a.sensor_id = s.id
JOIN controllers c ON s.controller_id = c.id
JOIN accounts acc ON c.account_id = acc.id
ORDER BY a.created_at DESC;
```

### 6. Check Test User
```sql
-- Check if test user exists
SELECT 
    u.id,
    u.email,
    u.phone,
    u.created_at,
    a.name as account_name,
    am.role
FROM users u
JOIN account_memberships am ON u.id = am.user_id
JOIN accounts a ON am.account_id = a.id
WHERE u.email = 'test@spectron.com';
```

### 7. Verify Database Schema
```sql
-- Check all columns in all tables
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
```

### 8. Check Indexes
```sql
-- List all indexes
\di

-- Or with SQL
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

### 9. Check Foreign Key Constraints
```sql
SELECT
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;
```

### 10. Quick Summary Query
```sql
-- Get a complete overview
SELECT 
    'accounts' as table_name, 
    COUNT(*) as row_count,
    (SELECT COUNT(*) FROM account_memberships WHERE account_id = accounts.id) as members
FROM accounts
GROUP BY accounts.id
UNION ALL
SELECT 'users', COUNT(*), NULL FROM users
UNION ALL
SELECT 'controllers', COUNT(*), NULL FROM controllers
UNION ALL
SELECT 'sensors', COUNT(*), NULL FROM sensors
UNION ALL
SELECT 'sensor_readings', COUNT(*), NULL FROM sensor_readings
UNION ALL
SELECT 'sensor_groups', COUNT(*), NULL FROM sensor_groups
UNION ALL
SELECT 'sensor_configurations', COUNT(*), NULL FROM sensor_configurations
UNION ALL
SELECT 'alerts', COUNT(*), NULL FROM alerts;
```

## Useful psql Commands

```sql
-- List all databases
\l

-- List all schemas
\dn

-- List all tables with sizes
\dt+

-- Describe a table structure
\d table_name

-- Show query execution time
\timing

-- Show query results in expanded format
\x

-- Exit psql
\q

-- Get help
\?
```

## One-Line Verification Script

Save this as `check-db.sql` and run: `psql -U your_user -d spectron -f check-db.sql`

```sql
-- Quick database verification
\echo '=== Database: ' 
SELECT current_database();

\echo ''
\echo '=== Tables:'
\dt

\echo ''
\echo '=== Row Counts:'
SELECT 'accounts' as table_name, COUNT(*) FROM accounts
UNION ALL SELECT 'users', COUNT(*) FROM users
UNION ALL SELECT 'controllers', COUNT(*) FROM controllers
UNION ALL SELECT 'sensors', COUNT(*) FROM sensors
UNION ALL SELECT 'sensor_readings', COUNT(*) FROM sensor_readings
UNION ALL SELECT 'alerts', COUNT(*) FROM alerts;

\echo ''
\echo '=== Test User:'
SELECT u.email, a.name as account, am.role 
FROM users u
JOIN account_memberships am ON u.id = am.user_id
JOIN accounts a ON am.account_id = a.id
WHERE u.email = 'test@spectron.com';
```
