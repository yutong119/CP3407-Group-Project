# SafeStay - Student Incident Reporting Platform
**Supervisior:** Dr. Da Sheng Liu

## Project Overview

SafeStay is a full-stack web application designed to help international students report, analyse and manage common incidents such as theft, fraud, rental disputes, passport loss, medical emergencies and personal safety concerns. The platform provides multilingual support, AI-assisted incident analysis, persistent evidence management, authority recommendations and case tracking throughout the entire reporting process.

## Team Members
- Group 3
- Frontend: [Sin Nather Paing - 14753575]
- Backend: [Yutong Ji - 14795504]
- Database: [Nang Laung Phoung - 14892210]

## Documentation
Complete project documentation is available on GitHub Pages.
Includes:
- Home page introducation
- Design (UI prototype, ERD diagram, Architecture diagram)
- Implementation
- Testing
- Development Tools

GitHub Pages:
https://yutong119.github.io/CP3407-Group-Project/

## Project Structure

```
CP3407-groupproject/
├── frontend/                     # Frontend web application (HTML/CSS/JavaScript)
│   ├── index.html                # Homepage
│   ├── login.html                # Login / Registration
│   ├── describe.html             # Incident description
│   ├── result.html               # Analysis result
│   ├── history.html              # Case history
│   ├── case_details.html         # Case details
│   ├── evidence.html             # Evidence checklist
│   ├── contacts.html             # Emergency contacts
│   ├── profile.html              # User profile
│   ├── language.html             # Language settings
│   ├── api.js                    # Frontend API service
│   └── i18n.js                   # Internationalisation
│
├── backend/                      # Node.js / Express backend
│   ├── server.js                 # Main server
│   ├── package.json              # Backend dependencies
│   ├── .env.example              # Environment template
│   ├── README.md                 # Backend setup guide
│   ├── middleware/
│   │   └── auth.js               # JWT authentication
│   ├── routes/                   # REST API endpoints
│   └── services/                 # Business logic
│
├── database/                     # Database resources
│   ├── database.sql              # MySQL schema
│   ├── ERD.md                    # Database design
│   └── DATA_DICTIONARY.md        # Data dictionary
│
├── docs/                         # GitHub Pages documentation
│   ├── index.md                  # Documentation homepage
│   ├── design.md                 # Architecture & UI design
│   ├── implementation.md         # Implementation details
│   ├── testing.md                # Testing & E2E results
│   ├── tools.md                  # Development tools
│   └── assets/                   # Images and screenshots
│
├── teacher_demo/                 # Teacher demonstration package
│   ├── TEACHER_TEST_GUIDE.md
│   ├── INTEGRATION_GUIDE.md
│   ├── database/
│   └── tests/
│
├── README.md                     # Project overview
├── package.json                  # Demo scripts
├── start-demo.sh                 # One-command demo launcher
└── .gitignore                    # Git ignore rules
```

## Key Features

### 1. **User Management**
   - User registration and login
   - JWT token-based authentication
   - User profile management
   - Password change functionality

### 2. **Case Management**
   - Create, read, update, delete cases
   - Case categorization (Theft, Fraud, Medical Emergency, etc.)
   - Case status tracking (In Progress, Resolved, etc.)
   - Urgency level classification

### 3. **Evidence Management**
   - File upload support (images, PDFs, documents)
   - Multiple files per case
   - File type validation
   - Maximum 50MB file size limit

### 4. **Case Analysis**
   - Detected case type prediction
   - Probability/confidence scoring
   - Checklist items for case resolution

### 5. Internationalisation
- English
- Chinese
- French
- Japanese
- Language preference persistence

### 6. Formal Report
- Automatically generated formal report
- Copy report
- Download report
- Printable format

### 7. Authority Recommendation
- Category-specific authority contacts
- Emergency phone numbers
- Mobile call support
- Desktop copy-number support

## Technology Stack

### Frontend

- HTML5
- CSS3
- Vanilla JavaScript
- Responsive Design
- Internationalisation (i18n)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **File Upload**: multer
- **Validation**: express-validator
- **CORS**: Enabled for cross-origin requests
- RESTful API
- mysql2

### Database
- MySQL 8.0+
- 8 relational tables:
  - users
  - case_categories
  - student_cases
  - evidence_files
  - checklist_items
  - checklist_templates
  - guidance_steps
  - authority_contacts

## Quick Start Guide

### Prerequisites
- Node.js (v14 or higher)
- MySQL Server (v8.0 or higher)
- npm or yarn

### Setup Instructions

#### 1. Database Setup
```bash
# Login to MySQL
mysql -u root -p

# Create and import database
CREATE DATABASE safestay_db;
USE safestay_db;
SOURCE /path/to/database/database.sql;
```

#### 2. Backend Setup
```bash
cd backend

# Copy environment file
cp .env.example .env

# Edit .env with your database credentials
# DB_HOST=localhost
# DB_USER=root
# DB_PASSWORD=your_password
# DB_NAME=safestay_db

# Install dependencies
npm install

# Start the server
npm start
# Server runs on http://localhost:5001
```

#### 3. Frontend Setup
- Open frontend files in a browser or serve with a simple HTTP server:
  ```bash
  # Using Python
  cd frontend
  python3 -m http.server 8000
  ```

### Mobile/LAN Testing

- `frontend/api.js` now auto-targets `http(s)://<current-host>:5001/api`, so desktop and phone can share the same backend host without manual edits.
- Example local-network flow:
  1. Run backend on your machine using port `5001`.
  2. Serve frontend from the same machine (for example, `python3 -m http.server 8000`).
  3. Open `http://<your-lan-ip>:8000` on your phone.
  4. Ensure your phone and computer are on the same network.

- Device-aware contact actions:
  - Mobile devices use `tel:` when tapping phone contacts.
  - Desktop shows a "Call from a mobile device" prompt with a one-click "Copy Number" action.
  - Email-only contacts open `mailto:`.
  - Website-only contacts open in a new `https` tab.

## API Documentation

### Base URL
```
http://localhost:5001/api
```

### Authentication Endpoints

#### Register
```
POST /auth/register
Body: {
  "email": "user@example.com",
  "password": "password123",
  "full_name": "John Doe",
  "preferred_language": "English"
}
```

#### Login
```
POST /auth/login
Body: {
  "email": "user@example.com",
  "password": "password123"
}
Response: {
  "success": true,
  "token": "JWT_TOKEN",
  "user": { ... }
}
```

### User Endpoints (Requires Authentication)

#### Get Profile
```
GET /users/profile
Headers: { "Authorization": "Bearer JWT_TOKEN" }
```

#### Update Profile
```
PUT /users/profile
Headers: { "Authorization": "Bearer JWT_TOKEN" }
Body: {
  "full_name": "New Name",
  "preferred_language": "English"
}
```

#### Change Password
```
POST /users/change-password
Headers: { "Authorization": "Bearer JWT_TOKEN" }
Body: {
  "old_password": "current_password",
  "new_password": "new_password"
}
```

### Case Endpoints (Require Authentication)

#### Get All Cases
```
GET /cases
Headers: { "Authorization": "Bearer JWT_TOKEN" }
```

#### Get Single Case
```
GET /cases/:case_id
Headers: { "Authorization": "Bearer JWT_TOKEN" }
```

#### Create Case
```
POST /cases
Headers: { "Authorization": "Bearer JWT_TOKEN" }
Body: {
  "category_id": 1,
  "case_title": "My Case",
  "description": "Detailed description",
  "location": "University Library",
  "urgency_level": "High",
  "detected_case": "Theft",
  "probability": 92.50
}
```

#### Update Case
```
PUT /cases/:case_id
Headers: { "Authorization": "Bearer JWT_TOKEN" }
Body: {
  "case_status": "Resolved",
  "urgency_level": "Medium",
  "detected_case": "Theft",
  "probability": 95.00
}
```

#### Delete Case
```
DELETE /cases/:case_id
Headers: { "Authorization": "Bearer JWT_TOKEN" }
```

### Evidence Endpoints (Require Authentication)

#### Upload File
```
POST /evidence
Headers: { "Authorization": "Bearer JWT_TOKEN" }
Body (FormData):
  - case_id: number
  - file: File
  - description: string (optional)
```

#### Get Case Evidence
```
GET /evidence/case/:case_id
Headers: { "Authorization": "Bearer JWT_TOKEN" }
```

#### Delete Evidence
```
DELETE /evidence/:evidence_id
Headers: { "Authorization": "Bearer JWT_TOKEN" }
```

### Category Endpoints

#### Get All Categories
```
GET /categories
```

#### Get Single Category
```
GET /categories/:category_id
```

## Database Schema

### Users Table
```sql
- user_id (INT, PK)
- full_name (VARCHAR)
- email (VARCHAR, UNIQUE)
- password_hash (VARCHAR)
- preferred_language (VARCHAR)
- created_at (TIMESTAMP)
```

### Case Categories Table
```sql
- category_id (INT, PK)
- category_name (VARCHAR)
- description (TEXT)
- urgency_level (VARCHAR)
```

### Student Cases Table
```sql
- case_id (INT, PK)
- user_id (INT, FK)
- category_id (INT, FK)
- case_title (VARCHAR)
- description (TEXT)
- location (VARCHAR)
- case_status (VARCHAR)
- urgency_level (VARCHAR)
- detected_case (VARCHAR)
- probability (DECIMAL)
- created_at (TIMESTAMP)
```

### Evidence Files Table
```sql
- evidence_id (INT, PK)
- case_id (INT, FK)
- file_name (VARCHAR)
- file_type (VARCHAR)
- file_path (VARCHAR)
- description (TEXT)
- uploaded_at (TIMESTAMP)
```

### Checklist Items Table
```sql
- checklist_id (INT, PK)
- case_id (INT, FK)
- item_name (VARCHAR)
- is_completed (BOOLEAN)
```

### Checklist Templates
```sql
- template_id (INT, PK)
- category_id (INT, FK)
- item_name (VARCHAR)
```

### Guidance Steps
```sql
- step_id (INT, PK)
- category_id (INT, FK)
- step_order (INT)
- step_text (TEXT)
```

### Authority Contacts
```sql
- contact_id (INT, PK)
- category_id (INT, FK, nullable)
- organisation_name (VARCHAR)
- phone_number (VARCHAR)
- email (VARCHAR)
- website (VARCHAR)
```

## Frontend Integration

See `INTEGRATION_GUIDE.md` for detailed instructions on integrating the frontend with the backend API. It includes:
- Login page integration
- Case listing implementation
- Case creation form handling
- Evidence file uploads
- Result page display
- Category dropdown loading

## Error Handling

All API endpoints return standard responses:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error (development only)"
}
```

## HTTP Status Codes
- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Authentication**: Expires in 7 days by default
- **File Validation**: Type and size checks on uploads
- **CORS**: Configured for safe cross-origin requests
- **Input Validation**: express-validator on all inputs
- **SQL Injection Prevention**: Using parameterized queries

## Development Tips

### Debugging
- Enable detailed logs by setting `NODE_ENV=development`
- Check browser console for frontend errors
- Check terminal output for backend logs

### Testing the API
- Use Postman or similar tools
- Include Bearer token in Authorization header for protected routes
- Test sample data is available in the database

### Common Issues
1. **CORS Errors**: Ensure backend CORS is enabled and frontend URL is allowed
2. **JWT Errors**: Check token expiration and format
3. **Database Connection**: Verify MySQL is running and credentials are correct
4. **File Upload Issues**: Check uploads directory exists and is writable

## Demo Credentials
```
Sample account:
Email: Linda3@goole.com
Password: 123456
```

## Future Enhancements
- Email notifications for case updates
- Case recommendation system
- Admin dashboard
- SMS notifications
- Case sharing with authorities

## Support
For detailed documentation, please refer to:

- GitHub Pages Documentation
- README.md
- teacher_demo/TEACHER_TEST_GUIDE.md
