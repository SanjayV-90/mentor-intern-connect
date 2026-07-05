-- ============================================================================
-- INTERN MANAGEMENT PORTAL - POSTGRESQL 3NF DATABASE SCHEMA
-- ============================================================================
-- Description: Complete 3NF normalized PostgreSQL schema with UUID keys, 
-- audit timestamps, soft deletion, indexes, foreign keys, and constraints.
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ROLES TABLE
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. USERS TABLE (Authentication & Account Status)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_APPROVAL',
    role_id UUID NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by VARCHAR(255) DEFAULT 'SYSTEM',
    updated_by VARCHAR(255) DEFAULT 'SYSTEM',
    CONSTRAINT chk_user_status CHECK (status IN ('PENDING_APPROVAL', 'ACTIVE', 'REJECTED', 'DISABLED')),
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_status ON users(status);
CREATE INDEX idx_users_role_id ON users(role_id);

-- 3. INTERN_PROFILES TABLE (1:1 with users)
CREATE TABLE IF NOT EXISTS intern_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    employee_id VARCHAR(50) UNIQUE,
    full_name VARCHAR(150) NOT NULL,
    gender VARCHAR(20),
    dob DATE,
    phone VARCHAR(30),
    address TEXT,
    college VARCHAR(255),
    degree VARCHAR(150),
    department VARCHAR(150),
    joining_date DATE,
    expected_end_date DATE,
    current_tech_stack TEXT,
    primary_skill VARCHAR(100),
    secondary_skill VARCHAR(100),
    github_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    profile_picture_url VARCHAR(500),
    profile_image_url VARCHAR(500),
    required_daily_hours DOUBLE PRECISION,
    resume_url TEXT,
    resume_file_name VARCHAR(255),
    resume_uploaded_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by VARCHAR(255) DEFAULT 'SYSTEM',
    updated_by VARCHAR(255) DEFAULT 'SYSTEM',
    CONSTRAINT fk_intern_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_intern_profiles_full_name ON intern_profiles(full_name);
CREATE INDEX idx_intern_profiles_college ON intern_profiles(college);
CREATE INDEX idx_intern_profiles_primary_skill ON intern_profiles(primary_skill);

-- 4. REFRESH_TOKENS TABLE
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    token VARCHAR(500) NOT NULL UNIQUE,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);

-- 5. LOGIN_HISTORY TABLE
CREATE TABLE IF NOT EXISTS login_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    login_timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    ip_address VARCHAR(50),
    user_agent VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    CONSTRAINT fk_login_history_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_login_history_user_id ON login_history(user_id);
CREATE INDEX idx_login_history_timestamp ON login_history(login_timestamp);

-- 6. ATTENDANCE TABLE
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    intern_id UUID NOT NULL,
    attendance_date DATE NOT NULL,
    login_time TIMESTAMP WITH TIME ZONE,
    logout_time TIMESTAMP WITH TIME ZONE,
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_out_time TIMESTAMP WITH TIME ZONE,
    working_hours VARCHAR(50),
    status VARCHAR(50) NOT NULL DEFAULT 'PRESENT',
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by VARCHAR(255) DEFAULT 'SYSTEM',
    updated_by VARCHAR(255) DEFAULT 'SYSTEM',
    CONSTRAINT chk_attendance_status CHECK (status IN ('PRESENT', 'ABSENT', 'HALF_DAY', 'LEAVE')),
    CONSTRAINT uq_intern_attendance_date UNIQUE (intern_id, attendance_date),
    CONSTRAINT fk_attendance_intern FOREIGN KEY (intern_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_attendance_intern_id ON attendance(intern_id);
CREATE INDEX idx_attendance_date ON attendance(attendance_date);
CREATE INDEX idx_attendance_status ON attendance(status);

-- 7. ASSIGNMENTS TABLE
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    intern_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    problem_url VARCHAR(500),
    tech_stack VARCHAR(50) NOT NULL,
    difficulty VARCHAR(20) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    time_taken_minutes INTEGER,
    status VARCHAR(50) NOT NULL DEFAULT 'SOLVED',
    notes TEXT,
    submission_date DATE DEFAULT CURRENT_DATE NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by VARCHAR(255) DEFAULT 'SYSTEM',
    updated_by VARCHAR(255) DEFAULT 'SYSTEM',
    CONSTRAINT chk_assignment_platform CHECK (platform IN ('LEETCODE', 'HACKERRANK', 'CODECHEF', 'GEEKSFORGEEKS', 'CODEFORCES', 'CUSTOM')),
    CONSTRAINT chk_assignment_tech CHECK (tech_stack IN ('JAVA', 'PYTHON', 'SQL', 'DATA_ENGINEERING', 'SPARK', 'SPRING_BOOT', 'DSA', 'REACT')),
    CONSTRAINT chk_assignment_diff CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    CONSTRAINT chk_assignment_status CHECK (status IN ('SOLVED', 'NOT_SOLVED')),
    CONSTRAINT fk_assignments_intern FOREIGN KEY (intern_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_assignments_intern_id ON assignments(intern_id);
CREATE INDEX idx_assignments_platform ON assignments(platform);
CREATE INDEX idx_assignments_tech_stack ON assignments(tech_stack);
CREATE INDEX idx_assignments_difficulty ON assignments(difficulty);
CREATE INDEX idx_assignments_submission_date ON assignments(submission_date);

-- 8. ASSIGNMENT_SCREENSHOTS TABLE (Normalized 1:N files)
CREATE TABLE IF NOT EXISTS assignment_screenshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size_bytes BIGINT,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_screenshots_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE
);

CREATE INDEX idx_screenshots_assignment_id ON assignment_screenshots(assignment_id);

-- 9. DUOLINGO_UPDATES TABLE
CREATE TABLE IF NOT EXISTS duolingo_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    intern_id UUID NOT NULL,
    current_streak INTEGER NOT NULL DEFAULT 0,
    language VARCHAR(100) NOT NULL,
    xp INTEGER NOT NULL DEFAULT 0,
    daily_goal_completed BOOLEAN DEFAULT TRUE NOT NULL,
    screenshot_url VARCHAR(500),
    update_date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_duolingo_intern FOREIGN KEY (intern_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_duolingo_intern_id ON duolingo_updates(intern_id);
CREATE INDEX idx_duolingo_update_date ON duolingo_updates(update_date);

-- 10. DAILY_TASKS TABLE
CREATE TABLE IF NOT EXISTS daily_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    intern_id UUID NOT NULL,
    task_name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    assigned_by VARCHAR(50) NOT NULL DEFAULT 'SELF',
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    estimated_hours DECIMAL(5,2),
    actual_hours DECIMAL(5,2),
    progress INTEGER DEFAULT 0 NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    start_date DATE,
    end_date DATE,
    completion_date DATE,
    notes TEXT,
    is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    created_by VARCHAR(255) DEFAULT 'SYSTEM',
    updated_by VARCHAR(255) DEFAULT 'SYSTEM',
    CONSTRAINT chk_task_assigned_by CHECK (assigned_by IN ('MANAGER', 'SELF')),
    CONSTRAINT chk_task_priority CHECK (priority IN ('LOW', 'MEDIUM', 'HIGH')),
    CONSTRAINT chk_task_status CHECK (status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED')),
    CONSTRAINT chk_task_progress CHECK (progress >= 0 AND progress <= 100),
    CONSTRAINT fk_daily_tasks_intern FOREIGN KEY (intern_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_daily_tasks_intern_id ON daily_tasks(intern_id);
CREATE INDEX idx_daily_tasks_status ON daily_tasks(status);
CREATE INDEX idx_daily_tasks_priority ON daily_tasks(priority);

-- 11. TASK_PROGRESS_HISTORY TABLE
CREATE TABLE IF NOT EXISTS task_progress_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID NOT NULL,
    old_progress INTEGER NOT NULL,
    new_progress INTEGER NOT NULL,
    old_status VARCHAR(50),
    new_status VARCHAR(50),
    remarks TEXT,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    recorded_by VARCHAR(255) DEFAULT 'SYSTEM',
    CONSTRAINT fk_progress_history_task FOREIGN KEY (task_id) REFERENCES daily_tasks(id) ON DELETE CASCADE
);

CREATE INDEX idx_progress_history_task_id ON task_progress_history(task_id);

-- 12. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(100) NOT NULL,
    is_read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_notifications_recipient FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_notifications_recipient_id ON notifications(recipient_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- 13. AUDIT_LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID,
    actor_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- 14. LEAVE_REQUESTS TABLE
CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    intern_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    admin_comment TEXT,
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    version BIGINT DEFAULT 0,
    CONSTRAINT chk_leave_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    CONSTRAINT chk_leave_type CHECK (leave_type IN ('SICK', 'CASUAL', 'PERSONAL', 'EMERGENCY', 'OTHER')),
    CONSTRAINT chk_leave_dates CHECK (start_date <= end_date)
);

CREATE INDEX IF NOT EXISTS idx_leave_intern_id ON leave_requests(intern_id);
CREATE INDEX IF NOT EXISTS idx_leave_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_leave_dates ON leave_requests(start_date, end_date);

