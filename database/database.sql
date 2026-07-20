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


CREATE TABLE checklist_templates (
    template_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    is_required BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (category_id) REFERENCES case_categories(category_id)
);

CREATE TABLE guidance_steps (
    step_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NOT NULL,
    step_order INT NOT NULL,
    step_title VARCHAR(255) NOT NULL,
    step_description TEXT,
    FOREIGN KEY (category_id) REFERENCES case_categories(category_id)
);

CREATE TABLE authority_contacts (
    contact_id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT NULL,
    contact_name VARCHAR(255) NOT NULL,
    contact_type VARCHAR(100),
    phone_number VARCHAR(50),
    email VARCHAR(255),
    website VARCHAR(255),
    description TEXT,
    FOREIGN KEY (category_id) REFERENCES case_categories(category_id)
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
(1, 1, 'Theft Case', 'My bag was stolen near the university library.', 'University Library', 'In Progress', 'High', 'Theft', 92.00),

-- Lost Passport
(2, 2, 'Lost Passport at Changi Airport', 'I accidentally lost my passport while waiting for my flight at Changi Airport Terminal 3.', 'Changi Airport Terminal 3', 'Resolved', 'High', 'Lost Passport', 96.50),

-- Scam / Online Fraud
(1, 3, 'Online Shopping Scam', 'I paid for a second-hand laptop through an online marketplace, but the seller disappeared after receiving the payment.', 'Orchard Road', 'Closed', 'High', 'Scam / Online Fraud', 94.20),

-- Rental Dispute
(2, 4, 'Rental Deposit Dispute', 'My landlord refused to return my rental deposit after I moved out, even though there was no damage to the room.', 'Yishun', 'In Progress', 'Medium', 'Rental Dispute', 89.80),

-- Medical Emergency
(1, 5, 'Food Poisoning', 'I experienced severe stomach pain and vomiting after eating at a restaurant and visited the emergency department.', 'Singapore General Hospital', 'Resolved', 'High', 'Medical Emergency', 97.30),

-- Other Issues
(2, 6, 'Need University Support', 'I am unsure which authority to contact regarding my personal safety concern and need guidance.', 'James Cook University Singapore', 'Closed', 'Medium', 'Other Issues', 72.40);



-- Sample evidence files
INSERT INTO evidence_files
(case_id, file_name, file_type, file_path, description)
VALUES
(1, 'photo_scene.jpg', 'image/jpeg', '/uploads/photo_scene.jpg', 'Photo of the place where the bag was stolen.'),
(1, 'receipt.pdf', 'application/pdf', '/uploads/receipt.pdf', 'Proof of ownership for the stolen item.'),

(2, 'passport_copy.jpg', 'image/jpeg', '/uploads/passport_copy.jpg', 'Photo or scanned copy of the lost passport.'),
(2, 'police_report_lost_passport.pdf', 'application/pdf', '/uploads/police_report_lost_passport.pdf', 'Police report made after the passport was lost.'),
(2, 'flight_itinerary.pdf', 'application/pdf', '/uploads/flight_itinerary.pdf', 'Flight itinerary showing upcoming travel details.'),

(3, 'scam_chat_screenshot.png', 'image/png', '/uploads/scam_chat_screenshot.png', 'Screenshot of the conversation with the suspected scammer.'),
(3, 'payment_receipt.pdf', 'application/pdf', '/uploads/payment_receipt.pdf', 'Proof of payment made to the suspected scammer.'),
(3, 'seller_profile.png', 'image/png', '/uploads/seller_profile.png', 'Screenshot of the seller profile and account information.'),

(4, 'rental_contract.pdf', 'application/pdf', '/uploads/rental_contract.pdf', 'Copy of the tenancy agreement signed by the student and landlord.'),
(4, 'deposit_payment_receipt.pdf', 'application/pdf', '/uploads/deposit_payment_receipt.pdf', 'Receipt showing payment of the rental deposit.'),
(4, 'landlord_chat_history.png', 'image/png', '/uploads/landlord_chat_history.png', 'Screenshot of messages exchanged with the landlord.'),

(5, 'medical_report.pdf', 'application/pdf', '/uploads/medical_report.pdf', 'Medical report issued by the hospital.'),
(5, 'hospital_bill.pdf', 'application/pdf', '/uploads/hospital_bill.pdf', 'Hospital bill and treatment receipt.'),
(5, 'medicine_prescription.jpg', 'image/jpeg', '/uploads/medicine_prescription.jpg', 'Photo of the medicine prescription provided by the doctor.'),

(6, 'incident_notes.txt', 'text/plain', '/uploads/incident_notes.txt', 'Written notes describing the personal safety concern.'),
(6, 'supporting_photo.jpg', 'image/jpeg', '/uploads/supporting_photo.jpg', 'Supporting photo related to the reported issue.');

-- Sample checklist items
INSERT INTO checklist_items (case_id, item_name, is_completed)
VALUES
-- Case 1: Theft
(1, 'Photos of the scene', TRUE),
(1, 'Receipts / Proof of ownership', TRUE),
(1, 'CCTV Footage', TRUE),
(1, 'Witness Information', FALSE),
(1, 'Police Report / Case Number', FALSE),
(1, 'Other Relevant Documents', FALSE),
(1, 'Anything else helpful', FALSE),

-- Case 2: Lost Passport
(2, 'Passport photo or copy', TRUE),
(2, 'Police report', TRUE),
(2, 'Embassy appointment details', FALSE),
(2, 'Travel itinerary', TRUE),
(2, 'Identification documents', TRUE),

-- Case 3: Scam / Online Fraud
(3, 'Screenshots of messages', TRUE),
(3, 'Payment proof', TRUE),
(3, 'Scammer contact details', TRUE),
(3, 'Bank statement', FALSE),
(3, 'Police report', TRUE),

-- Case 4: Rental Dispute
(4, 'Rental contract', TRUE),
(4, 'Payment records', TRUE),
(4, 'Chat history with landlord', TRUE),
(4, 'Property photos', FALSE),
(4, 'Deposit receipt', TRUE),

-- Case 5: Medical Emergency
(5, 'Medical report', TRUE),
(5, 'Hospital bill or receipt', TRUE),
(5, 'Insurance document', FALSE),
(5, 'Doctor prescription', TRUE),
(5, 'Emergency contact information', TRUE),

-- Case 6: Other Issues
(6, 'Incident description', TRUE),
(6, 'Supporting evidence', TRUE),
(6, 'Witness information', FALSE),
(6, 'Relevant documents', FALSE),
(6, 'University support request', TRUE);

-- Sample checklist templates 
INSERT INTO checklist_templates (category_id, item_name, description, is_required)
VALUES
-- Theft
(1, 'Photos of the scene', 'Upload photos of the location or damaged/lost items if available.', TRUE),
(1, 'Receipts / Proof of ownership', 'Upload receipts or documents proving the item belongs to you.', TRUE),
(1, 'CCTV Footage', 'Check whether CCTV footage is available near the incident location.', FALSE),
(1, 'Witness Information', 'Add witness name or contact details if anyone saw the incident.', FALSE),
(1, 'Police Report / Case Number', 'Add the police report number after reporting the theft.', TRUE),
(1, 'Bank card cancellation confirmation', 'Provide proof that your lost bank cards have been cancelled if applicable.', FALSE),
(1, 'Insurance claim documents', 'Upload insurance claim documents if the stolen item is insured.', FALSE),

-- Lost Passport
(2, 'Passport photo or copy', 'Upload a photo or scanned copy of your passport if available.', TRUE),
(2, 'Police report', 'Upload the police report for the lost passport.', TRUE),
(2, 'Embassy appointment details', 'Record your embassy appointment or contact details.', TRUE),
(2, 'Travel itinerary', 'Upload flight tickets or travel documents if affected.', FALSE),
(2, 'Identification document', 'Upload another identification document such as a student ID or NRIC copy.', TRUE),
(2, 'Embassy payment receipt', 'Upload the receipt for passport replacement if available.', FALSE),


-- Scam / Online Fraud
(3, 'Screenshots of messages', 'Upload screenshots of chat messages, emails, or scam websites.', TRUE),
(3, 'Payment proof', 'Upload bank transfer receipts or payment screenshots.', TRUE),
(3, 'Scammer contact details', 'Record phone number, email, website, or social media account.', TRUE),
(3, 'Bank statement', 'Upload a bank statement showing the fraudulent transaction.', FALSE),
(3, 'Police report', 'Upload the police report related to the scam.', TRUE),

-- Rental Dispute
(4, 'Rental contract', 'Upload your rental agreement or tenancy contract.', TRUE),
(4, 'Payment records', 'Upload rent payment receipts or bank transfer records.', TRUE),
(4, 'Chat history with landlord', 'Upload screenshots of communication with landlord or agent.', FALSE),
(4, 'Property photos', 'Upload photos showing the condition of the rental property.', FALSE),
(4, 'Deposit refund request', 'Upload emails or letters requesting the return of your deposit.', FALSE),

-- Medical Emergency
(5, 'Medical report', 'Upload medical report or consultation document if available.', TRUE),
(5, 'Hospital bill or receipt', 'Upload medical bill or payment receipt.', FALSE),
(5, 'Insurance document', 'Upload insurance information if available.', FALSE),
(5, 'Doctor prescription', 'Upload the prescription issued by the attending doctor.', FALSE),
(5, 'Emergency contact information', 'Provide emergency contact details if available.', TRUE),

-- Other Issues
(6, 'Incident description', 'Write a clear description of what happened.', TRUE),
(6, 'Supporting evidence', 'Upload any useful documents, photos, or screenshots.', FALSE),
(6, 'Witness information', 'Provide contact details of any witnesses if applicable.', FALSE),
(6, 'University support request', 'Record any request submitted to the university support office.', FALSE);

-- Sample guidance steps 
INSERT INTO guidance_steps (category_id, step_order, step_title, step_description)
VALUES
-- Theft
(1, 1, 'Stay safe', 'Move to a safe location and avoid confronting the suspect.'),
(1, 2, 'Collect evidence', 'Prepare photos, receipts, witness details, and CCTV information if available.'),
(1, 3, 'Report to police', 'Make a police report and keep the case number.'),

-- Lost Passport
(2, 1, 'Report the loss', 'Report the lost passport to the police as soon as possible.'),
(2, 2, 'Contact embassy', 'Contact your embassy or high commission for passport replacement guidance.'),
(2, 3, 'Prepare documents', 'Prepare identification, passport copy, police report, and travel itinerary.'),

-- Scam / Online Fraud
(3, 1, 'Stop communication', 'Do not send more money or personal information to the scammer.'),
(3, 2, 'Save evidence', 'Save screenshots, payment proof, phone numbers, emails, and website links.'),
(3, 3, 'Report the scam', 'Report the scam to the police or relevant online fraud reporting channel.'),

-- Rental Dispute
(4, 1, 'Review your contract', 'Check your rental agreement for deposit, rent, and termination terms.'),
(4, 2, 'Collect records', 'Save payment receipts, messages, emails, and photos of the property.'),
(4, 3, 'Seek support', 'Contact university support, legal aid, or a tenant support service if needed.'),

-- Medical Emergency
(5, 1, 'Call emergency help', 'Call emergency medical services if the situation is urgent.'),
(5, 2, 'Visit hospital or clinic', 'Go to the nearest hospital or clinic for medical attention.'),
(5, 3, 'Keep medical records', 'Keep medical reports, bills, receipts, and insurance documents.'),

-- Other Issues
(6, 1, 'Describe the issue clearly', 'Write down what happened, when it happened, and where it happened.'),
(6, 2, 'Collect supporting evidence', 'Upload photos, screenshots, documents, or witness details.'),
(6, 3, 'Ask for support', 'Contact university support or relevant authority for advice.');

-- Sample authority contacts
INSERT INTO authority_contacts 
(category_id, contact_name, contact_type, phone_number, email, website, description)
VALUES
(NULL, 'Singapore Police Force', 'Police', '999', NULL, 'https://www.police.gov.sg', 'Call for urgent police emergency.'),
(NULL, 'Ambulance / SCDF', 'Hospital', '995', NULL, 'https://www.scdf.gov.sg', 'Call for ambulance or fire emergency.'),
(NULL, 'University Student Support', 'University Support', NULL, 'support@example.edu', NULL, 'Contact university support for student assistance.'),
(NULL, 'Legal Aid Bureau', 'Legal Aid', NULL, NULL, 'https://lab.mlaw.gov.sg', 'Provides legal aid information.'),
(NULL, 'Embassy Support', 'Embassy', NULL, NULL, NULL, 'Contact your country embassy for international student support.'),

(1, 'Singapore Police Force', 'Police', '999', NULL, 'https://www.police.gov.sg', 'Recommended for theft cases.'),
(2, 'Embassy Support', 'Embassy', NULL, NULL, NULL, 'Recommended for lost passport cases.'),
(3, 'Singapore Police Force', 'Police', '999', NULL, 'https://www.police.gov.sg', 'Recommended for scam or fraud cases.'),
(4, 'Legal Aid Bureau', 'Legal Aid', NULL, NULL, 'https://lab.mlaw.gov.sg', 'Recommended for rental dispute cases.'),
(5, 'Ambulance / SCDF', 'Hospital', '995', NULL, 'https://www.scdf.gov.sg', 'Recommended for medical emergency cases.'),
(6, 'University Student Support', 'University Support', NULL, 'support@example.edu', NULL, 'Recommended for general or unclear student issues.'),
(3, 'Anti-Scam Helpline', 'Scam Support', '1800-722-6688', NULL, 'https://www.scamalert.sg', 'Recommended for scam prevention advice and reporting support.');