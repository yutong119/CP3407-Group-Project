# SafeStay Backend API

SafeStay is a platform that helps students report and manage various incidents (theft, fraud, rental disputes, etc.).

## Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials:
   ```
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=safestay_db
   DB_PORT=3306
   JWT_SECRET=your_secret_key_here
   PORT=5000
   ```

3. **Setup Database:**
   - Import the database schema from `../database/database.sql`:
     ```bash
     mysql -u root -p safestay_db < ../database/database.sql
     ```

4. **Run the server:**
   ```bash
   npm start
   ```
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- **POST** `/api/auth/register` - Register new user
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "full_name": "John Doe",
    "preferred_language": "English"
  }
  ```

- **POST** `/api/auth/login` - Login user
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```

### Users
- **GET** `/api/users/profile` - Get user profile (requires token)
- **PUT** `/api/users/profile` - Update profile
- **POST** `/api/users/change-password` - Change password

### Cases
- **GET** `/api/cases` - Get all cases for logged-in user
- **GET** `/api/cases/:case_id` - Get specific case details
- **POST** `/api/cases` - Create new case
  ```json
  {
    "category_id": 1,
    "case_title": "Theft Case",
    "description": "My bag was stolen...",
    "location": "University Library",
    "urgency_level": "High",
    "detected_case": "Theft",
    "probability": 92.00
  }
  ```
- **PUT** `/api/cases/:case_id` - Update case
- **DELETE** `/api/cases/:case_id` - Delete case

### Evidence Files
- **POST** `/api/evidence` - Upload evidence file
  ```
  Form Data:
  - case_id: integer
  - file: file (image/pdf/doc)
  - description: string (optional)
  ```
- **GET** `/api/evidence/case/:case_id` - Get all files for a case
- **DELETE** `/api/evidence/:evidence_id` - Delete evidence file

### Categories
- **GET** `/api/categories` - Get all case categories
- **GET** `/api/categories/:category_id` - Get specific category

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## Response Format
All responses follow this format:
```json
{
  "success": true/false,
  "message": "Description",
  "data": {}
}
```

## File Upload
- Maximum file size: 50MB
- Allowed file types: JPEG, PNG, GIF, PDF, Word, Text
- Files are stored in the `uploads` directory

## Project Structure
```
backend/
├── server.js              # Main server file
├── package.json
├── .env.example
├── README.md
├── middleware/
│   └── auth.js           # JWT authentication
├── routes/
│   ├── auth.js           # Authentication endpoints
│   ├── users.js          # User management
│   ├── cases.js          # Case management
│   ├── evidence.js       # Evidence file handling
│   └── categories.js     # Case categories
└── uploads/              # Uploaded files directory
```

## Error Handling
The API returns appropriate HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Server Error

## Security Considerations
- Passwords are hashed using bcryptjs
- JWT tokens expire after 7 days
- CORS is enabled for cross-origin requests
- File uploads are validated by type and size
- User data is validated before database operations
