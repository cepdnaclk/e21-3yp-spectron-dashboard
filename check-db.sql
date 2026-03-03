-- Quick Database Verification Script
-- Run with: psql -U your_user -d spectron -f check-db.sql

\echo '========================================'
\echo 'SPECTRON DATABASE VERIFICATION'
\echo '========================================'
\echo ''

\echo '=== Database Information ==='
SELECT current_database() as database, current_user as user, version() as postgres_version;
\echo ''

\echo '=== All Tables ==='
\dt
\echo ''

\echo '=== Row Counts ==='
SELECT 
    'accounts' as table_name, 
    COUNT(*) as row_count 
FROM accounts
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
SELECT 'alerts', COUNT(*) FROM alerts
ORDER BY table_name;
\echo ''

\echo '=== Test User Check ==='
SELECT 
    u.email,
    u.phone,
    a.name as account_name,
    am.role,
    u.created_at
FROM users u
JOIN account_memberships am ON u.id = am.user_id
JOIN accounts a ON am.account_id = a.id
WHERE u.email = 'test@spectron.com';
\echo ''

\echo '=== Accounts ==='
SELECT id, name, created_at FROM accounts;
\echo ''

\echo '=== Users (without password hash) ==='
SELECT id, email, phone, created_at FROM users;
\echo ''

\echo '=== Account Memberships ==='
SELECT 
    u.email,
    a.name as account_name,
    am.role
FROM account_memberships am
JOIN users u ON am.user_id = u.id
JOIN accounts a ON am.account_id = a.id;
\echo ''

\echo '=== Controllers ==='
SELECT 
    c.id,
    c.hw_id,
    c.name,
    c.purpose,
    c.status,
    a.name as account_name
FROM controllers c
JOIN accounts a ON c.account_id = a.id;
\echo ''

\echo '=== Sensors ==='
SELECT 
    s.id,
    s.hw_id,
    s.type,
    s.name,
    s.purpose,
    s.status,
    c.name as controller_name
FROM sensors s
JOIN controllers c ON s.controller_id = c.id;
\echo ''

\echo '=== Recent Sensor Readings (last 5) ==='
SELECT 
    sr.time,
    s.name as sensor_name,
    sr.value,
    sr.meta
FROM sensor_readings sr
JOIN sensors s ON sr.sensor_id = s.id
ORDER BY sr.time DESC
LIMIT 5;
\echo ''

\echo '=== Alerts ==='
SELECT 
    a.id,
    a.type,
    a.message,
    a.severity,
    a.acknowledged_at,
    a.created_at,
    s.name as sensor_name
FROM alerts a
JOIN sensors s ON a.sensor_id = s.id
ORDER BY a.created_at DESC;
\echo ''

\echo '========================================'
\echo 'VERIFICATION COMPLETE'
\echo '========================================'
