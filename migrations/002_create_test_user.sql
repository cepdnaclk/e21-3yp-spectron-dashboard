-- Create a test user account
-- Password: test123 (bcrypt hash: $2a$10$HFP2381rrG.BZv7Bc.b.YOhV8Gg7sGlsKypZs14kya2J73ncWJzBG)

-- Generate UUIDs (you can also use gen_random_uuid() in PostgreSQL)
DO $$
DECLARE
    v_user_id UUID := gen_random_uuid();
    v_account_id UUID := gen_random_uuid();
    v_email TEXT := 'test@spectron.com';
    v_password_hash TEXT := '$2a$10$HFP2381rrG.BZv7Bc.b.YOhV8Gg7sGlsKypZs14kya2J73ncWJzBG';
    v_phone TEXT := '+1234567890';
    v_name TEXT := 'Test Account';
BEGIN
    -- Check if user already exists
    IF EXISTS (SELECT 1 FROM users WHERE email = v_email) THEN
        RAISE EXCEPTION 'User with email % already exists', v_email;
    END IF;

    -- Create user
    INSERT INTO users (id, email, password_hash, phone)
    VALUES (v_user_id, v_email, v_password_hash, v_phone);

    -- Create account
    INSERT INTO accounts (id, name)
    VALUES (v_account_id, v_name);

    -- Create membership (user is OWNER of their account)
    INSERT INTO account_memberships (account_id, user_id, role)
    VALUES (v_account_id, v_user_id, 'OWNER');

    RAISE NOTICE 'Test user created successfully!';
    RAISE NOTICE 'Email: %', v_email;
    RAISE NOTICE 'Password: test123';
    RAISE NOTICE 'User ID: %', v_user_id;
    RAISE NOTICE 'Account ID: %', v_account_id;
END $$;
