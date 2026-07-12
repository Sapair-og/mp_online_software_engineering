-- ====================================================================
-- DATABASE SCHEMA & QUERIES FOR TASKLY
-- Compatible with SQLite, PostgreSQL, and MySQL
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. TABLE DEFINITIONS (DDL)
-- --------------------------------------------------------------------

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL, -- Storing encrypted/hashed passwords
    name VARCHAR(100) NOT NULL,
    avatar_color VARCHAR(50) NOT NULL,   -- HSL value e.g. "260, 85%, 65%"
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index username for faster authentication lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Categories table
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    color VARCHAR(50) NOT NULL           -- HSL value e.g. "210, 100%, 55%"
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL CHECK (status IN ('todo', 'in_progress', 'review', 'completed')),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
    category_name VARCHAR(50),
    due_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_name) REFERENCES categories(name) ON DELETE SET NULL
);

-- Indexes for quick dashboard filtering
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);

-- Subtasks / Checklist items table
CREATE TABLE IF NOT EXISTS subtasks (
    id VARCHAR(50) PRIMARY KEY,
    task_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Task Comments table
CREATE TABLE IF NOT EXISTS comments (
    id VARCHAR(50) PRIMARY KEY,
    task_id VARCHAR(50) NOT NULL,
    user_name VARCHAR(100) NOT NULL,
    avatar_color VARCHAR(50) NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
);

-- Activity Logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    task_title VARCHAR(255) NOT NULL,
    action VARCHAR(100) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);


-- --------------------------------------------------------------------
-- 2. CORE APPLICATION QUERIES (DML)
-- --------------------------------------------------------------------

-- A. USER AUTHENTICATION & REGISTRATION

-- 1. Create a new user (Registration)
-- Parameters: :id, :username, :password_hash, :name, :avatar_color, :bio
INSERT INTO users (id, username, password_hash, name, avatar_color, bio)
VALUES (?, ?, ?, ?, ?, ?);

-- 2. Retrieve user by username (Login check)
-- Parameters: :username
SELECT id, username, password_hash, name, avatar_color, bio 
FROM users 
WHERE username = ?;

-- 3. Update user profile settings
-- Parameters: :name, :bio, :avatar_color, :user_id
UPDATE users 
SET name = ?, bio = ?, avatar_color = ? 
WHERE id = ?;


-- B. TASK MANAGEMENT (CRUD)

-- 1. Create a task
-- Parameters: :id, :user_id, :title, :description, :status, :priority, :category_name, :due_date
INSERT INTO tasks (id, user_id, title, description, status, priority, category_name, due_date)
VALUES (?, ?, ?, ?, ?, ?, ?, ?);

-- 2. Fetch all tasks for a specific user (with categories join)
-- Parameters: :user_id
SELECT t.*, c.color AS category_color 
FROM tasks t
LEFT JOIN categories c ON t.category_name = c.name
WHERE t.user_id = ?
ORDER BY t.created_at DESC;

-- 3. Search and filter tasks dynamically
-- Parameters: :user_id, :priority_filter, :category_filter, :search_query
SELECT t.*, c.color AS category_color 
FROM tasks t
LEFT JOIN categories c ON t.category_name = c.name
WHERE t.user_id = ?
  AND (? = 'all' OR t.priority = ?)
  AND (? = 'all' OR t.category_name = ?)
  AND (t.title LIKE ? OR t.description LIKE ?)
ORDER BY t.created_at DESC;

-- 4. Update task details
-- Parameters: :title, :description, :status, :priority, :category_name, :due_date, :task_id, :user_id
UPDATE tasks 
SET title = ?, description = ?, status = ?, priority = ?, category_name = ?, due_date = ?
WHERE id = ? AND user_id = ?;

-- 5. Delete a task
-- Parameters: :task_id, :user_id
DELETE FROM tasks 
WHERE id = ? AND user_id = ?;


-- C. SUBTASKS & COMMENTS

-- 1. Fetch subtasks for a task
-- Parameters: :task_id
SELECT id, title, is_completed 
FROM subtasks 
WHERE task_id = ?;

-- 2. Add a subtask
-- Parameters: :id, :task_id, :title
INSERT INTO subtasks (id, task_id, title, is_completed) 
VALUES (?, ?, ?, FALSE);

-- 3. Toggle subtask completion status
-- Parameters: :is_completed, :subtask_id
UPDATE subtasks 
SET is_completed = ? 
WHERE id = ?;

-- 4. Add comment to discussion
-- Parameters: :id, :task_id, :user_name, :avatar_color, :text
INSERT INTO comments (id, task_id, user_name, avatar_color, text)
VALUES (?, ?, ?, ?, ?);


-- D. ACTIVITY LOGS

-- 1. Log an action
-- Parameters: :id, :user_id, :task_title, :action
INSERT INTO activity_logs (id, user_id, task_title, action)
VALUES (?, ?, ?, ?);

-- 2. Fetch recent user activities (capped to 50)
-- Parameters: :user_id
SELECT task_title, action, timestamp 
FROM activity_logs 
WHERE user_id = ? 
ORDER BY timestamp DESC 
LIMIT 50;


-- E. DASHBOARD ANALYTICS QUERIES

-- 1. General status counts (Dashboard overview card stats)
-- Parameters: :user_id
SELECT 
    COUNT(*) AS total_tasks,
    SUM(CASE WHEN status = 'todo' THEN 1 ELSE 0 END) AS todo_count,
    SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) AS in_progress_count,
    SUM(CASE WHEN status = 'review' THEN 1 ELSE 0 END) AS review_count,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_count,
    SUM(CASE WHEN due_date < CURRENT_DATE AND status != 'completed' THEN 1 ELSE 0 END) AS overdue_count
FROM tasks
WHERE user_id = ?;

-- 2. Priority breakdown (Doughnut chart)
-- Parameters: :user_id
SELECT priority, COUNT(*) AS count
FROM tasks
WHERE user_id = ?
GROUP BY priority;

-- 3. Category workload breakdown (Progress bars load)
-- Parameters: :user_id
SELECT 
    category_name, 
    COUNT(*) AS total_count,
    SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_count
FROM tasks
WHERE user_id = ?
GROUP BY category_name;
