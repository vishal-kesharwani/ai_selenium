# Backend Structure

## Project Organization

```
backend/
├── __init__.py              # Backend package initialization
├── app.py                   # Flask application factory & routes
├── config.py                # Configuration management
├── models.py                # Database models
├── test_runner.py           # Selenium test execution
└── utils/
    ├── __init__.py          # Utils package init
    ├── analyze_website.py   # Website analysis & recommendations
    ├── ai_analyzer.py       # AI-powered failure analysis
    ├── s3_uploader.py       # S3 file upload utility
    └── slack_notifier.py    # Slack notification utility
```

## Starting the Backend

```bash
# From root directory
python run.py
```

## API Endpoints

### Authentication
- `POST /api/register` - Register new user
- `POST /api/login` - User login

### Testing
- `POST /api/analyze` - Analyze website and get recommendations
- `POST /api/run_tests/<test_run_id>` - Run automated tests
- `GET /api/reports` - Get test reports
- `POST /api/manual_test` - Create manual test

### File Management
- `POST /api/upload` - Upload file
- `GET /api/files` - List user files
- `GET /api/files/<file_id>` - Download file
- `DELETE /api/files/<file_id>` - Delete file

### Export
- `POST /api/export_pdf` - Export test report as PDF
- `GET /api/metrics` - Get user metrics

## Environment Variables

```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/ai_selenium
JWT_SECRET=your-secret-key
OPEN_AI_KEY=your-openai-key
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
S3_BUCKET=your-bucket-name
SLACK_WEBHOOK_URL=your-slack-webhook
```

## Dependencies

See `../requirements.txt` for all backend dependencies.

## Key Features

✅ JWT-based authentication
✅ MongoDB integration
✅ Selenium WebDriver testing
✅ AI-powered failure analysis
✅ File upload/download management
✅ PDF report generation
✅ S3 integration
✅ Slack notifications
