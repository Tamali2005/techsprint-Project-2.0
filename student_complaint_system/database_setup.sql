-- ============================================
-- Student Complaint Management System Database
-- Updated based on PDF requirements
-- ============================================

-- Create Database
CREATE DATABASE IF NOT EXISTS student_complaints;
USE student_complaints;

-- ============================================
-- 1. STUDENTS TABLE (Updated)
-- ============================================
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    department VARCHAR(100) NOT NULL,
    course VARCHAR(100),
    year_of_study VARCHAR(20),
    section VARCHAR(20),
    identity_type ENUM('Student', 'Staff', 'Faculty', 'Other') DEFAULT 'Student',
    password VARCHAR(255),
    google_id VARCHAR(255),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_student_id (student_id),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. COMPLAINTS TABLE (Updated)
-- ============================================
CREATE TABLE IF NOT EXISTS complaints (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    student_name VARCHAR(100) NOT NULL,
    student_email VARCHAR(100) NOT NULL,
    student_phone VARCHAR(20) NOT NULL,
    department VARCHAR(200) NOT NULL,
    identity_type VARCHAR(50) NOT NULL,
    category_type VARCHAR(100) NOT NULL,
    complaint_type VARCHAR(200) NOT NULL,
    complaint_title VARCHAR(300) NOT NULL,
    detailed_description TEXT NOT NULL,
    proof_file_path VARCHAR(500),
    complaint_mode ENUM('Online', 'In-person') DEFAULT 'Online',
    priority VARCHAR(20) DEFAULT 'Medium',
    status VARCHAR(50) DEFAULT 'Pending',
    admin_response TEXT,
    submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    response_date TIMESTAMP NULL,
    
    FOREIGN KEY (student_id) REFERENCES students(student_id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_status (status),
    INDEX idx_category (category_type),
    INDEX idx_student_id (student_id),
    INDEX idx_submission_date (submission_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. ADMINS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_username (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. INSERT DEFAULT ADMIN
-- ============================================
-- Password: admin123 (SHA-256 hashed)
INSERT INTO admins (username, password, email) 
VALUES (
    'admin', 
    '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 
    'admin@college.edu'
) ON DUPLICATE KEY UPDATE username=username;

-- ============================================
-- 5. INSERT SAMPLE STUDENTS (Optional - for testing)
-- ============================================
-- Password for all: password123 (SHA-256 hashed)
INSERT INTO students (student_id, full_name, email, phone, department, course, year_of_study, section, identity_type, password)
VALUES 
    ('STU001', 'John Doe', 'john.doe@student.edu', '+1234567890', 'Computer Science Engineering', 'B.Tech', '3rd Year', 'A', 'Student', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f'),
    ('STU002', 'Jane Smith', 'jane.smith@student.edu', '+1234567891', 'Electronics and Communication', 'B.Tech', '2nd Year', 'B', 'Student', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f'),
    ('FAC001', 'Dr. Mike Johnson', 'mike.j@college.edu', '+1234567892', 'Mechanical Engineering', 'Faculty', 'N/A', 'N/A', 'Faculty', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f')
ON DUPLICATE KEY UPDATE student_id=student_id;

-- ============================================
-- 6. INSERT SAMPLE COMPLAINTS (Optional - for testing)
-- ============================================
INSERT INTO complaints (student_id, student_name, student_email, student_phone, department, identity_type, 
                       category_type, complaint_type, complaint_title, detailed_description, complaint_mode, priority, status)
VALUES 
    ('STU001', 'John Doe', 'john.doe@student.edu', '+1234567890', 'Computer Science Engineering, B.Tech, 3rd Year, Section A', 'Student',
     'Infrastructure & Facilities', 'Classroom conditions', 'Broken AC in Computer Lab 3', 
     'The air conditioning system in Computer Lab 3 has been malfunctioning for the past week. The room temperature exceeds 35°C, making it extremely difficult for students to concentrate during practical sessions. This issue needs immediate attention as it affects the learning environment.', 
     'Online', 'High', 'Pending'),
    
    ('STU002', 'Jane Smith', 'jane.smith@student.edu', '+1234567891', 'Electronics and Communication, B.Tech, 2nd Year, Section B', 'Student',
     'Campus Services', 'Medical or health services', 'Insufficient Medical Supplies', 
     'The campus health center frequently runs out of basic medical supplies and medicines. Last week, when I visited for a fever, they did not have basic medicines available. This is a serious concern for student health and safety.',
     'In-person', 'High', 'In Progress'),
    
    ('FAC001', 'Dr. Mike Johnson', 'mike.j@college.edu', '+1234567892', 'Mechanical Engineering, Faculty', 'Faculty',
     'Administrative', 'Document processing delays', 'Delay in Leave Application Processing', 
     'I submitted my leave application two weeks ago through the online portal, but it has not been processed yet. This delay is causing issues with my planned travel arrangements. I request the administration to expedite the process.',
     'Online', 'Medium', 'Resolved')
ON DUPLICATE KEY UPDATE id=id;

-- ============================================
-- 7. UPDATE SAMPLE ADMIN RESPONSE
-- ============================================
UPDATE complaints 
SET admin_response = 'We acknowledge the issue with medical supplies. We have placed an emergency order and increased the monthly budget for the health center. The supplies will be restocked within 2 days.',
    status = 'In Progress',
    response_date = NOW()
WHERE id = 2;

UPDATE complaints 
SET admin_response = 'Your leave application has been approved. We apologize for the delay. We are working on streamlining our approval process to prevent such delays in the future.',
    status = 'Resolved',
    response_date = NOW()
WHERE id = 3;

-- ============================================
-- 8. VIEWS FOR EASY ACCESS
-- ============================================

-- View for complete complaint information
CREATE OR REPLACE VIEW complaint_details AS
SELECT 
    c.id,
    c.student_id,
    c.student_name,
    c.student_email,
    c.student_phone,
    c.department,
    c.identity_type,
    c.category_type,
    c.complaint_type,
    c.complaint_title,
    c.detailed_description,
    c.proof_file_path,
    c.complaint_mode,
    c.priority,
    c.status,
    c.admin_response,
    c.submission_date,
    c.response_date
FROM complaints c;

-- View for dashboard statistics
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM students) as total_students,
    (SELECT COUNT(*) FROM complaints) as total_complaints,
    (SELECT COUNT(*) FROM complaints WHERE status = 'Pending') as pending_complaints,
    (SELECT COUNT(*) FROM complaints WHERE status = 'In Progress') as inprogress_complaints,
    (SELECT COUNT(*) FROM complaints WHERE status = 'Resolved') as resolved_complaints,
    (SELECT COUNT(*) FROM complaints WHERE status = 'Rejected') as rejected_complaints;

-- View for category-wise complaint count
CREATE OR REPLACE VIEW category_stats AS
SELECT 
    category_type,
    COUNT(*) as complaint_count,
    SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending,
    SUM(CASE WHEN status = 'In Progress' THEN 1 ELSE 0 END) as in_progress,
    SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved
FROM complaints
GROUP BY category_type;

-- ============================================
-- 9. USEFUL QUERIES
-- ============================================

-- View all complaints with full details
-- SELECT * FROM complaint_details ORDER BY submission_date DESC;

-- Count complaints by category
-- SELECT category_type, complaint_type, COUNT(*) as count 
-- FROM complaints 
-- GROUP BY category_type, complaint_type 
-- ORDER BY category_type, count DESC;

-- Get pending complaints by priority
-- SELECT * FROM complaints 
-- WHERE status = 'Pending' 
-- ORDER BY FIELD(priority, 'Urgent', 'High', 'Medium', 'Low'), submission_date ASC;

-- Get complaints by identity type
-- SELECT identity_type, COUNT(*) as count 
-- FROM complaints 
-- GROUP BY identity_type;

-- Search complaints by keyword
-- SELECT * FROM complaints 
-- WHERE complaint_title LIKE '%keyword%' 
-- OR detailed_description LIKE '%keyword%';

-- ============================================
-- DATABASE SETUP COMPLETE!
-- ============================================

SELECT 'Database created successfully!' as message;
SELECT COUNT(*) as admin_count FROM admins;
SELECT COUNT(*) as student_count FROM students;
SELECT COUNT(*) as complaint_count FROM complaints;