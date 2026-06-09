-- CP3407 SafeStay Database
-- Iteration 1 Initial Database Schema

DROP DATABASE IF EXISTS safestay_db;
CREATE DATABASE safestay_db;
USE safestay_db;

-- 1. Users table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    preferred_language VARCHAR(50) DEFAULT 'English',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Case categories table
CREATE TABLE case_categories (
    category_id INT AUTO_INCREMENT PRIMARY KEY,
    category_name VARCHAR(100) NOT NULL,
    description TEXT,
    urgency_level VARCHAR(50)
);

-- 3. Student cases table
CREATE TABLE student_cases (
    case_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    category_id INT NOT NULL,
    case_title VARCHAR(150),
    description TEXT NOT NULL,
    location VARCHAR(255),
    case_status VARCHAR(50) DEFAULT 'In Progress',
    urgency_level VARCHAR(50),
    detected_case VARCHAR(100),
    probability DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (category_id) REFERENCES case_categories(category_id)
);

-- 4. Evidence files table
CREATE TABLE evidence_files (
    evidence_id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    file_name VARCHAR(255),
    file_type VARCHAR(50),
    file_path VARCHAR(255),
    description TEXT,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (case_id) REFERENCES student_cases(case_id)
);

-- 5. Checklist items table
CREATE TABLE checklist_items (
    checklist_id INT AUTO_INCREMENT PRIMARY KEY,
    case_id INT NOT NULL,
    item_name VARCHAR(150) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,

    FOREIGN KEY (case_id) REFERENCES student_cases(case_id)
);

-- Sample users
INSERT INTO users (full_name, email, password_hash, preferred_language)
VALUES
('Yutong Ji', 'yutong@example.com', 'hashed_password_here', 'English'),
('Nang Laung Phoung', 'nang@example.com', 'hashed_password_here', 'English');

-- Sample case categories
INSERT INTO case_categories (category_name, description, urgency_level)
VALUES
('Theft', 'Lost or stolen items, bags, phones, wallets, etc.', 'High'),
('Lost Passport', 'Lost or stolen passport or travel documents.', 'High'),
('Scam / Online Fraud', 'Online scams, payment fraud, fake websites, phishing, etc.', 'High'),
('Rental Dispute', 'Issues with landlord, rent, deposit, or contract.', 'Medium'),
('Medical Emergency', 'Injury, illness, or medical consultation.', 'High'),
('Other Issues', 'Other incidents or unsure what to choose.', 'Medium');

-- Sample student case
INSERT INTO student_cases 
(user_id, category_id, case_title, description, location, case_status, urgency_level, detected_case, probability)
VALUES
(1, 1, 'Theft Case', 'My bag was stolen near the university library.', 'University Library', 'In Progress', 'High', 'Theft', 92.00);

-- Sample evidence files
INSERT INTO evidence_files 
(case_id, file_name, file_type, file_path, description)
VALUES
(1, 'photo_scene.jpg', 'image/jpeg', '/uploads/photo_scene.jpg', 'Photo of the place where the bag was stolen.'),
(1, 'receipt.pdf', 'application/pdf', '/uploads/receipt.pdf', 'Proof of ownership for the stolen item.');

-- Sample checklist items
INSERT INTO checklist_items (case_id, item_name, is_completed)
VALUES
(1, 'Photos of the scene', TRUE),
(1, 'Receipts / Proof of ownership', TRUE),
(1, 'CCTV Footage', TRUE),
(1, 'Witness Information', FALSE),
(1, 'Police Report / Case Number', FALSE),
(1, 'Other Relevant Documents', FALSE),
(1, 'Anything else helpful', FALSE);