# Cameroon National ID Tracking Portal

A comprehensive web application for managing national ID card applications in Cameroon, featuring both citizen-facing and administrative interfaces.

## Key Features

### For Citizens:
- Secure user registration and login
- Online application submission with document upload
- Real-time application status tracking
- Mobile-responsive interface

### For Administrators:
- Dashboard for application management
- Application review and approval system
- User management capabilities
- Audit logging

## Technology Stack

**Frontend:**
- Tailwind CSS for responsive design
- Font Awesome for icons
- Vanilla JavaScript for interactivity

**Backend:**
- Node.js with Express.js
- SQLite database
- JWT authentication
- Multer for file uploads

## Installation Guide

1. **Prerequisites:**
   - Node.js (v16 or higher)
   - npm (v8 or higher)

2. **Setup:**
   ```bash
   git clone https://github.com/yourusername/cameroon-id-portal.git
   cd cameroon-id-portal
   npm install
   ```

3. **Configuration:**
   - Copy `.env.example` to `.env`
   - Set your JWT secret and other environment variables

4. **Running the Application:**
   ```bash
   # Development mode
   npm run dev

   # Production mode
   npm start
   ```

5. **Accessing the Application:**
   - Frontend: `http://localhost:8000` (via Python HTTP server)
   - Backend API: `http://localhost:3000`

## File Structure

```
cameroon-id-portal/
├── backend/
│   ├── server.js          # Express server configuration
│   ├── database.js        # Database connection and models
│   ├── routes/            # All API endpoints
│   └── uploads/           # Document storage
├── frontend/
│   └── pages/             # All HTML pages
├── .env                   # Environment configuration
├── package.json           # Dependency management
└── README.md              # Project documentation
```

## Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens with expiration for authentication
- File upload size and type restrictions
- CORS policies implemented

## Support

For technical support, please contact:
- Email: id.cameroon.tracking@gmail.com
- Phone: (+237) 652776172
- Support Agent: Esther ID-CAM VERIFICATION SUPPORT

## License

This project is licensed under the MIT License.