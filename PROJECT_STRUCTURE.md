# 🚀 AI Selenium Framework - Production SaaS

A complete AI-powered Selenium testing framework with modern web interface, automated testing, and intelligent failure analysis.

## 📁 Project Structure

```
ai-selenium-framework/
├── backend/                 # Flask backend (REST API)
│   ├── __init__.py
│   ├── app.py              # Flask app & routes  
│   ├── config.py           # Configuration
│   ├── models.py           # Database models
│   ├── test_runner.py      # Selenium test execution
│   ├── utils/              # Utility modules
│   │   ├── analyze_website.py
│   │   ├── ai_analyzer.py
│   │   ├── s3_uploader.py
│   │   └── slack_notifier.py
│   └── README.md           # Backend documentation
│
├── frontend/               # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # Auth context
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── storage/                # File storage
│   ├── uploads/            # User uploads
│   ├── reports/            # Test reports
│   └── screenshots/        # Test screenshots
│
├── static/                 # Static files (frontend build)
├── tests/                  # Test cases
├── reports/                # Generated test reports
├── screenshots/            # Test screenshots
│
├── .env                    # Environment configuration
├── run.py                  # ⭐ Start the Flask server
├── requirements.txt        # Python dependencies
├── docker-compose.yml      # Docker setup
├── Dockerfile              # Container definition
└── README.md               # This file
```

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 14+
- MongoDB Atlas
- Chrome/Chromium browser

### 1. Setup Environment

```bash
# Copy .env file and update with your credentials
cp .env.example .env
```

### 2. Install Backend Dependencies

```bash
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### 3. Install Frontend Dependencies

```bash
cd frontend
npm install
```

### 4. Start Backend Server

```bash
python run.py
```

The server will run on `http://localhost:5000`

### 5. Start Frontend Development Server

```bash
cd frontend
npm run dev
```

The frontend will run on `http://localhost:5173` (or next available port)

## 📋 Features

### ✅ Authentication
- User registration and login
- JWT-based token authentication
- Secure password hashing

### ✅ Automated Testing
- AI-powered test recommendations
- Selenium WebDriver integration
- Automatic element detection
- Test execution and reporting

### ✅ Manual Testing
- Create and manage manual tests
- Test execution tracking
- Results documentation

### ✅ File Management
- File upload (50MB max)
- File organization by type (upload/report/screenshot)
- Download and delete functionality
- Metadata storage in MongoDB

### ✅ Reporting
- PDF export of test results
- Test history tracking
- Performance metrics
- AI-powered failure analysis

### ✅ Integrations
- MongoDB Atlas database
- OpenAI/OpenRouter for AI analysis
- AWS S3 for file storage
- Slack notifications
- PDF generation (ReportLab)

## 🔧 Configuration

### Environment Variables (.env)

```env
# MongoDB
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/ai_selenium

# JWT
JWT_SECRET=your-secret-key

# AI/LLM
OPEN_AI_KEY=your-openai-key

# AWS S3 (optional)
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=us-east-1
S3_BUCKET=your-bucket

# Slack (optional)
SLACK_WEBHOOK_URL=your-webhook
```

## 📦 API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login

### Testing
- `POST /api/analyze` - Analyze website
- `POST /api/run_tests/<id>` - Run tests
- `GET /api/reports` - Get reports
- `POST /api/manual_test` - Create manual test

### Files
- `POST /api/upload` - Upload file
- `GET /api/files` - List files
- `GET /api/files/<id>` - Download file
- `DELETE /api/files/<id>` - Delete file

### Reporting
- `POST /api/export_pdf` - Export PDF
- `GET /api/metrics` - Get metrics

## 🐳 Docker Deployment

```bash
docker-compose up --build
```

## 🧪 Testing

```bash
# Run tests
python -m pytest tests/

# Run with coverage
python -m pytest --cov=backend tests/
```

## 📚 Documentation

- [Backend Guide](backend/README.md)
- [API Documentation](http://localhost:5000/docs)
- [Frontend Guide](frontend/README.md)

## 🛠️ Development

### Backend
- Flask REST API
- Flask-PyMongo integration
- Flask-JWT-Extended authentication
- CORS enabled

### Frontend
- React 18
- Vite build tool
- React Bootstrap UI
- Axios for API calls

## 🤝 Contributing

1. Create feature branch (`git checkout -b feature/amazing-feature`)
2. Commit changes (`git commit -m 'Add amazing feature'`)
3. Push to branch (`git push origin feature/amazing-feature`)
4. Open Pull Request

## 📝 License

This project is proprietary and confidential.

## 🆘 Support

For issues and questions, please create an issue or contact the development team.

---

**Last Updated**: February 2026
**Status**: Production Ready ✅
