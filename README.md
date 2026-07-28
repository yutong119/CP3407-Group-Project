# SafeStay - Student Incident Reporting Platform

## Project Overview

SafeStay is a web application designed to help international students report and manage various incidents such as theft, fraud, rental disputes, medical emergencies, and other issues. The platform includes case management, evidence file uploads, checklist tracking, and case analysis features.

## Project Structure

```
CP3407-groupproject/
├── frontend/                 # Frontend UI (HTML/CSS/JavaScript)
│   ├── index.html           # Homepage
│   ├── login.html           # Login/Registration page
│   ├── describe.html        # Case description form
│   ├── result.html          # Case analysis results
│   └── api.js               # API integration service
│
├── backend/                 # Node.js/Express API Server
│   ├── server.js            # Main server file
│   ├── package.json         # Dependencies
│   ├── .env.example         # Environment template
│   ├── README.md            # Backend documentation
│   ├── middleware/
│   │   └── auth.js          # JWT authentication
│   └── routes/
│       ├── auth.js          # Authentication endpoints
│       ├── users.js         # User management
│       ├── cases.js         # Case CRUD operations
│       ├── evidence.js      # File upload handling
│       └── categories.js    # Case categories
│
├── database/
│   └── database.sql         # MySQL database schema
│
├── INTEGRATION_GUIDE.md     # Frontend-backend integration guide
├── README.md                # This file
└── .gitignore              # Git ignore rules
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

## Technology Stack

### Frontend
- HTML5
- CSS3
- Vanilla JavaScript
- Modern, responsive UI

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **File Upload**: multer
- **Validation**: express-validator
- **CORS**: Enabled for cross-origin requests

### Database
- MySQL 8.0+
- 5 main tables: users, case_categories, student_cases, evidence_files, checklist_items

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
# Server runs on http://localhost:5000
```

#### 3. Frontend Setup
- Update API_BASE_URL in `frontend/api.js` if needed
- Open frontend files in a browser or serve with a simple HTTP server:
  ```bash
  # Using Python
  cd frontend
  python3 -m http.server 8000
  ```

## API Documentation

### Base URL
```
http://localhost:5000/api
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

## Team Members
- Frontend: [Team member 1]
- Backend: [Team member 2]
- Database: [Team member 3]

## Demo Credentials
```
Email: yutong@example.com
Password: (use register to create new account)
```

## Future Enhancements
- Email notifications for case updates
- Case recommendation system
- Admin dashboard
- Multi-language support
- SMS notifications
- Case sharing with authorities
- Analytics and reporting

## Support
For issues or questions, contact the development team or refer to the backend README.md for more technical details.

---
Last Updated: 2026-06-15
Version: 1.0.0
