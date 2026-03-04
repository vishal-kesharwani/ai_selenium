
# AI Selenium 
A production-level SaaS for automated website testing using AI and Selenium.

## Features

- User authentication (register/login)
- Website analysis and test recommendations
- Automated UI interaction testing
- AI-powered failure analysis
- Test reports and metrics
- Slack notifications
- S3 storage integration

## Setup

1. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Set environment variables in `.env`:
   ```
   OPEN_AI_KEY=your_openai_key
   JWT_SECRET=your_jwt_secret
   S3_BUCKET=your_s3_bucket (optional)
   SLACK_WEBHOOK=your_slack_webhook (optional)
   ```

3. Run the app:
   ```
   python app.py
   ```

4. Open http://localhost:5000 in your browser.

## Usage

1. Register/Login with email and password.
2. Enter a website URL (public or localhost if your app is running).
3. Click "Analyze & Generate Tests" to get test recommendations.
4. Click "Run Tests" to execute the tests.
5. View results and reports.

## Architecture

- **Backend**: Flask with JWT auth, SQLAlchemy DB
- **Frontend**: Simple HTML/JS (can be upgraded to React)
- **Testing**: Selenium with ChromeDriver
- **AI**: OpenAI for failure analysis
- **Storage**: SQLite (dev), can upgrade to PostgreSQL
- **Deployment**: Docker ready

## Production Deployment

- Use PostgreSQL instead of SQLite
- Deploy to AWS/Heroku with Docker
- Add rate limiting, monitoring
- For localhost apps: Use ngrok or similar to expose localhost to the SaaS

## API Endpoints

- `POST /register` - Register user
- `POST /login` - Login user
- `POST /analyze` - Analyze URL and generate tests
- `POST /run_tests/<id>` - Run tests for a test run
- `GET /reports` - Get user reports
- `GET /metrics` - Get user metrics

## Extending

- Add more test types (API testing, performance)
- Integrate with CI/CD pipelines
- Add team collaboration features
- Implement payment/subscription model
=======
