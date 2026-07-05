-- ============================================================================
-- INTERN MANAGEMENT PORTAL - SEED DATA
-- ============================================================================
-- Password for all seeded users is: Admin@12345 (BCrypt encrypted)
-- BCrypt Hash: $2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG
-- ============================================================================

-- Seed Roles
INSERT INTO roles (id, name, description) 
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'ADMIN', 'Batch Manager and System Administrator'),
    ('22222222-2222-2222-2222-222222222222', 'INTERN', 'Intern Software Engineer / Trainee')
ON CONFLICT (name) DO NOTHING;

-- Seed Pre-Created Admin Account
INSERT INTO users (id, email, password_hash, status, role_id, is_deleted)
VALUES (
    '33333333-3333-3333-3333-333333333333',
    'admin@portal.com',
    '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG',
    'ACTIVE',
    '11111111-1111-1111-1111-111111111111',
    FALSE
) ON CONFLICT (email) DO NOTHING;

-- Seed Sample Active Intern 1
INSERT INTO users (id, email, password_hash, status, role_id, is_deleted)
VALUES (
    '44444444-4444-4444-4444-444444444444',
    'alex.intern@gmail.com',
    '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG',
    'ACTIVE',
    '22222222-2222-2222-2222-222222222222',
    FALSE
) ON CONFLICT (email) DO NOTHING;

INSERT INTO intern_profiles (
    id, user_id, employee_id, full_name, gender, dob, phone, address, 
    college, degree, department, joining_date, expected_end_date, 
    current_tech_stack, primary_skill, secondary_skill, github_url, linkedin_url
) VALUES (
    '55555555-5555-5555-5555-555555555555',
    '44444444-4444-4444-4444-444444444444',
    'INT-2026-001',
    'Alex Rivera',
    'Male',
    '2003-05-14',
    '+1-555-0192',
    '123 Tech Avenue, Silicon Valley, CA',
    'Stanford University',
    'B.S. Computer Science',
    'Software Engineering',
    '2026-06-01',
    '2026-08-31',
    'Spring Boot, React, PostgreSQL, Java, TypeScript',
    'Java',
    'React',
    'https://github.com/alexrivera-dev',
    'https://linkedin.com/in/alexrivera-dev'
) ON CONFLICT (user_id) DO NOTHING;

-- Seed Sample Pending Intern 2
INSERT INTO users (id, email, password_hash, status, role_id, is_deleted)
VALUES (
    '66666666-6666-6666-6666-666666666666',
    'maya.pending@gmail.com',
    '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG',
    'PENDING_APPROVAL',
    '22222222-2222-2222-2222-222222222222',
    FALSE
) ON CONFLICT (email) DO NOTHING;

INSERT INTO intern_profiles (
    id, user_id, employee_id, full_name, gender, dob, phone, address, 
    college, degree, department, joining_date, expected_end_date, 
    current_tech_stack, primary_skill, secondary_skill, github_url, linkedin_url
) VALUES (
    '77777777-7777-7777-7777-777777777777',
    '66666666-6666-6666-6666-666666666666',
    'INT-2026-002',
    'Maya Lin',
    'Female',
    '2004-01-20',
    '+1-555-0283',
    '456 Innovation Way, Boston, MA',
    'MIT',
    'B.S. Data Science',
    'Data Analytics',
    '2026-06-15',
    '2026-09-15',
    'Python, Spark, SQL, Data Engineering',
    'Python',
    'SQL',
    'https://github.com/mayalin-ds',
    'https://linkedin.com/in/mayalin-ds'
) ON CONFLICT (user_id) DO NOTHING;

-- Seed Sample Attendance for Alex Rivera
INSERT INTO attendance (intern_id, attendance_date, login_time, logout_time, status, remarks)
VALUES 
    ('44444444-4444-4444-4444-444444444444', CURRENT_DATE - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days 9 hours', CURRENT_TIMESTAMP - INTERVAL '3 days 1 hour', 'PRESENT', 'On time'),
    ('44444444-4444-4444-4444-444444444444', CURRENT_DATE - INTERVAL '2 days', CURRENT_TIMESTAMP - INTERVAL '2 days 9 hours', CURRENT_TIMESTAMP - INTERVAL '2 days 1 hour', 'PRESENT', 'On time'),
    ('44444444-4444-4444-4444-444444444444', CURRENT_DATE - INTERVAL '1 day', CURRENT_TIMESTAMP - INTERVAL '1 day 9 hours', CURRENT_TIMESTAMP - INTERVAL '1 day 5 hours', 'HALF_DAY', 'Medical appointment afternoon'),
    ('44444444-4444-4444-4444-444444444444', CURRENT_DATE, CURRENT_TIMESTAMP - INTERVAL '4 hours', NULL, 'PRESENT', 'Logged in for today')
ON CONFLICT (intern_id, attendance_date) DO NOTHING;

-- Seed Sample Assignments for Alex Rivera
INSERT INTO assignments (intern_id, title, platform, problem_url, tech_stack, difficulty, time_taken_minutes, status, notes, submission_date)
VALUES 
    ('44444444-4444-4444-4444-444444444444', 'Two Sum & LRU Cache', 'LEETCODE', 'https://leetcode.com/problems/lru-cache/', 'JAVA', 'MEDIUM', 45, 'SOLVED', 'Optimal O(1) get and put using HashMap and DoublyLinkedList', CURRENT_DATE - INTERVAL '2 days'),
    ('44444444-4444-4444-4444-444444444444', 'Spring Security JWT Filter Implementation', 'CUSTOM', 'https://github.com/alexrivera-dev/spring-jwt-demo', 'SPRING_BOOT', 'HARD', 120, 'SOLVED', 'Implemented stateless JWT authentication with refresh token rotation', CURRENT_DATE - INTERVAL '1 day'),
    ('44444444-4444-4444-4444-444444444444', 'Complex Window Functions in SQL', 'HACKERRANK', 'https://hackerrank.com/challenges/sql-window', 'SQL', 'MEDIUM', 35, 'SOLVED', 'Used RANK() and DENSE_RANK() over partition', CURRENT_DATE);

-- Seed Duolingo Streak for Alex Rivera
INSERT INTO duolingo_updates (intern_id, current_streak, language, xp, daily_goal_completed, update_date)
VALUES ('44444444-4444-4444-4444-444444444444', 14, 'Spanish', 1250, TRUE, CURRENT_DATE);

-- Seed Daily Tasks for Alex Rivera
INSERT INTO daily_tasks (intern_id, task_name, description, category, assigned_by, priority, estimated_hours, actual_hours, progress, status, start_date, end_date)
VALUES 
    ('44444444-4444-4444-4444-444444444444', 'Build REST API for Attendance', 'Implement Controller, Service, and Spec filtering for attendance records', 'Backend Development', 'MANAGER', 'HIGH', 6.0, 5.5, 100, 'COMPLETED', CURRENT_DATE - INTERVAL '2 days', CURRENT_DATE - INTERVAL '1 day'),
    ('44444444-4444-4444-4444-444444444444', 'Design Frontend Analytics Dashboard', 'Integrate Recharts with TanStack Query endpoints', 'Frontend Development', 'MANAGER', 'HIGH', 8.0, 4.0, 50, 'IN_PROGRESS', CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day');
