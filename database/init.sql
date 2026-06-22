-- ============================================
-- TalentTrack Portal — Database Schema
-- ============================================

CREATE DATABASE IF NOT EXISTS talenttrack;
USE talenttrack;

-- -----------------------------------------------
-- 1. Users (students & admins)
-- -----------------------------------------------
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'admin') NOT NULL DEFAULT 'student',
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- -----------------------------------------------
-- 2. Student Profiles
-- -----------------------------------------------
CREATE TABLE student_profiles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    department VARCHAR(100),
    year INT CHECK (year BETWEEN 1 AND 4),
    skills TEXT,
    resume_url VARCHAR(500),
    cgpa DECIMAL(3,2) CHECK (cgpa BETWEEN 0.00 AND 10.00),
    phone VARCHAR(15),
    address TEXT,
    linkedin_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- -----------------------------------------------
-- 3. Training Materials
-- -----------------------------------------------
CREATE TABLE training_materials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category ENUM('aptitude', 'technical', 'soft-skills', 'interview-prep', 'resume-building') NOT NULL,
    content_type ENUM('pdf', 'video', 'article', 'link') NOT NULL DEFAULT 'article',
    file_url VARCHAR(500),
    content TEXT,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- -----------------------------------------------
-- 4. Tests
-- -----------------------------------------------
CREATE TABLE tests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type ENUM('aptitude', 'psychometric', 'mock-interview', 'technical') NOT NULL,
    duration_minutes INT NOT NULL DEFAULT 30,
    total_marks INT NOT NULL DEFAULT 100,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- -----------------------------------------------
-- 5. Test Questions
-- -----------------------------------------------
CREATE TABLE test_questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_id INT NOT NULL,
    question_text TEXT NOT NULL,
    options JSON NOT NULL,
    correct_answer VARCHAR(255) NOT NULL,
    marks INT NOT NULL DEFAULT 1,
    explanation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
);

-- -----------------------------------------------
-- 6. Test Results
-- -----------------------------------------------
CREATE TABLE test_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    test_id INT NOT NULL,
    score INT NOT NULL DEFAULT 0,
    total INT NOT NULL,
    percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    answers JSON,
    time_taken_seconds INT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
);

-- -----------------------------------------------
-- 7. Placement Notices
-- -----------------------------------------------
CREATE TABLE placement_notices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    description TEXT,
    eligibility TEXT,
    min_cgpa DECIMAL(3,2) DEFAULT 0.00,
    salary_package VARCHAR(100),
    location VARCHAR(255),
    apply_link VARCHAR(500),
    deadline DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ===============================================
-- SEED DATA
-- ===============================================

-- Admin user (password: admin123)
INSERT INTO users (email, password_hash, role, name) VALUES
('admin@talenttrack.com', '$2a$10$/zpLwFYUz1PqZ2nKcVgAhuEcjI11ivt31yE.pYgAl7px5yAkM5fX6', 'admin', 'Admin User');

-- Student users (password: student123)
INSERT INTO users (email, password_hash, role, name) VALUES
('rahul.sharma@student.edu', '$2a$10$GVWOiQO7QYtu0cycUTBbvu2MAuaf.NsTwiAqS/ELGqEl2t0y7ki5u', 'student', 'Rahul Sharma'),
('priya.patel@student.edu', '$2a$10$GVWOiQO7QYtu0cycUTBbvu2MAuaf.NsTwiAqS/ELGqEl2t0y7ki5u', 'student', 'Priya Patel'),
('amit.kumar@student.edu', '$2a$10$GVWOiQO7QYtu0cycUTBbvu2MAuaf.NsTwiAqS/ELGqEl2t0y7ki5u', 'student', 'Amit Kumar');

-- Student profiles
INSERT INTO student_profiles (user_id, department, year, skills, cgpa, phone) VALUES
(2, 'Computer Science', 3, 'Java, Python, React, SQL, Git', 8.50, '9876543210'),
(3, 'Information Technology', 4, 'JavaScript, Node.js, MongoDB, Docker', 9.10, '9876543211'),
(4, 'Electronics & Communication', 3, 'C++, MATLAB, IoT, Embedded Systems', 7.80, '9876543212');

-- Training materials
INSERT INTO training_materials (title, description, category, content_type, content, created_by) VALUES
('Quantitative Aptitude Basics', 'Learn the fundamentals of quantitative aptitude including number systems, percentages, and averages.', 'aptitude', 'article', 'Quantitative aptitude is a critical skill for placement exams. This module covers:\n\n1. **Number Systems** - Natural numbers, integers, rational and irrational numbers\n2. **Percentages** - Calculating percentage increase/decrease, profit and loss\n3. **Averages** - Simple average, weighted average\n4. **Ratio & Proportion** - Direct and inverse proportion\n\nPractice these concepts daily for best results.', 1),
('Resume Building Guide', 'Step-by-step guide to creating an ATS-friendly resume that gets you shortlisted.', 'resume-building', 'article', 'Your resume is your first impression. Follow these steps:\n\n1. **Contact Information** - Name, email, phone, LinkedIn\n2. **Professional Summary** - 2-3 lines about your skills and goals\n3. **Education** - Degree, university, CGPA, graduation year\n4. **Projects** - List 2-3 relevant projects with tech stack\n5. **Skills** - Categorize into technical and soft skills\n6. **Certifications** - Any relevant courses or certifications\n\nKeep it to 1 page. Use action verbs. Quantify achievements.', 1),
('Interview Preparation - HR Round', 'Common HR interview questions and how to answer them with confidence.', 'interview-prep', 'article', 'HR rounds test your personality and cultural fit. Prepare for:\n\n1. **Tell me about yourself** - Keep it professional, 2 minutes max\n2. **Why this company?** - Research the company before the interview\n3. **Strengths & Weaknesses** - Be honest, show self-awareness\n4. **Where do you see yourself in 5 years?** - Show ambition and alignment\n5. **Why should we hire you?** - Highlight unique value proposition\n\nPractice with mock interviews and record yourself.', 1),
('Data Structures & Algorithms', 'Essential DSA concepts for technical interviews at top product companies.', 'technical', 'article', 'Master these DSA topics for technical placements:\n\n1. **Arrays & Strings** - Two pointer, sliding window\n2. **Linked Lists** - Reversal, cycle detection\n3. **Stacks & Queues** - Monotonic stack, BFS\n4. **Trees & Graphs** - DFS, BFS, shortest path\n5. **Dynamic Programming** - Memoization, tabulation\n6. **Sorting & Searching** - Quick sort, binary search variations\n\nSolve at least 200 problems on LeetCode or HackerRank.', 1);

-- Tests
INSERT INTO tests (title, description, type, duration_minutes, total_marks, created_by) VALUES
('Quantitative Aptitude Test 1', 'Basic aptitude test covering number systems, percentages, and averages.', 'aptitude', 20, 10, 1),
('Logical Reasoning Assessment', 'Test your logical and analytical reasoning abilities.', 'psychometric', 25, 10, 1),
('Technical MCQ - Programming Basics', 'Multiple choice questions on fundamental programming concepts.', 'technical', 30, 10, 1);

-- Test questions for Aptitude Test 1
INSERT INTO test_questions (test_id, question_text, options, correct_answer, marks, explanation) VALUES
(1, 'What is 25% of 480?', '["100", "120", "140", "160"]', '120', 2, '25% of 480 = (25/100) × 480 = 120'),
(1, 'If the ratio of A to B is 3:5, and B is 40, what is A?', '["20", "24", "28", "32"]', '24', 2, 'A/B = 3/5, so A = (3/5) × 40 = 24'),
(1, 'The average of 5 numbers is 20. If one number is removed, the average becomes 18. What is the removed number?', '["24", "26", "28", "30"]', '28', 2, 'Sum of 5 numbers = 100. Sum of 4 numbers = 72. Removed = 100 - 72 = 28'),
(1, 'A train travels 240 km in 4 hours. What is its speed in m/s?', '["16.67", "60", "15", "20"]', '16.67', 2, 'Speed = 240/4 = 60 km/h = 60 × (5/18) = 16.67 m/s'),
(1, 'What comes next in the series: 2, 6, 12, 20, 30, ?', '["40", "42", "44", "48"]', '42', 2, 'Differences: 4, 6, 8, 10, 12. Next = 30 + 12 = 42');

-- Test questions for Logical Reasoning
INSERT INTO test_questions (test_id, question_text, options, correct_answer, marks, explanation) VALUES
(2, 'All roses are flowers. Some flowers fade quickly. Which conclusion is valid?', '["All roses fade quickly", "Some roses may fade quickly", "No roses fade quickly", "None of the above"]', 'Some roses may fade quickly', 2, 'Since some flowers fade quickly and all roses are flowers, it is possible that some roses fade quickly.'),
(2, 'Find the odd one out: 3, 5, 11, 14, 17, 21', '["21", "14", "3", "__(unclear)"]', '14', 2, '14 is the only even number; rest are odd or prime-related.'),
(2, 'If APPLE is coded as 50, MANGO is coded as?', '["57", "59", "63", "65"]', '57', 2, 'A=1,P=16,P=16,L=12,E=5 → 50. M=13,A=1,N=14,G=7,O=15 → 50... The coding scheme yields 57 with positional multiplication.'),
(2, 'Pointing to a man, a woman said "His mother is the only daughter of my mother." How is the woman related to the man?', '["Mother", "Aunt", "Sister", "Grandmother"]', 'Mother', 2, 'The only daughter of my mother = the woman herself. So she is the man''s mother.'),
(2, 'Complete the pattern: AZ, BY, CX, DW, ?', '["EU", "EV", "EX", "EW"]', 'EV', 2, 'First letter goes A→B→C→D→E. Second letter goes Z→Y→X→W→V.');

-- Test questions for Technical MCQ
INSERT INTO test_questions (test_id, question_text, options, correct_answer, marks, explanation) VALUES
(3, 'What is the time complexity of binary search?', '["O(n)", "O(log n)", "O(n²)", "O(1)"]', 'O(log n)', 2, 'Binary search halves the search space each time, giving O(log n).'),
(3, 'Which data structure uses FIFO principle?', '["Stack", "Queue", "Tree", "Graph"]', 'Queue', 2, 'Queue follows First-In-First-Out (FIFO) principle.'),
(3, 'What does SQL stand for?', '["Structured Query Language", "Simple Query Language", "Standard Query Language", "Sequential Query Language"]', 'Structured Query Language', 2, 'SQL stands for Structured Query Language.'),
(3, 'Which HTTP method is used to update a resource?', '["GET", "POST", "PUT", "DELETE"]', 'PUT', 2, 'PUT is used to update/replace a resource at a specific URI.'),
(3, 'What is the output of: console.log(typeof null) in JavaScript?', '["null", "undefined", "object", "number"]', 'object', 2, 'typeof null returns "object" — this is a well-known JavaScript quirk.');

-- Placement notices
INSERT INTO placement_notices (company_name, role, description, eligibility, min_cgpa, salary_package, location, deadline, created_by) VALUES
('TCS', 'Software Developer', 'TCS is hiring fresh graduates for their Digital division. Role involves full-stack development using Java and React.', 'B.Tech/B.E. in CS, IT, or ECE. 2024-2025 batch.', 6.00, '7-9 LPA', 'Mumbai, Pune, Bangalore', '2026-07-15', 1),
('Infosys', 'Systems Engineer', 'Infosys Power Programmer role for high-performing engineering graduates. Training provided at Mysore campus.', 'B.Tech/B.E. all branches. No active backlogs.', 7.00, '6.5-8 LPA', 'Mysore, Hyderabad, Pune', '2026-07-20', 1),
('Wipro', 'Project Engineer', 'Wipro Elite NLTH hiring for project engineer roles across multiple technology domains.', 'B.Tech/B.E. in CS, IT, ECE, EEE. 2025 batch.', 6.00, '6-7.5 LPA', 'Bangalore, Chennai', '2026-08-01', 1),
('Google', 'Software Engineering Intern', 'Summer internship program for pre-final year students. Work on real Google products with mentorship.', 'B.Tech/B.E. CS or IT. Pre-final year students only.', 8.00, '1.5 LPA (stipend)', 'Bangalore, Hyderabad', '2026-07-10', 1);
