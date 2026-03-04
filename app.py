from flask import Flask, request, jsonify, send_from_directory, send_file
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from flask_pymongo import PyMongo
import os
import json
from datetime import datetime
from bson import ObjectId
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib import colors
from io import BytesIO
from dotenv import load_dotenv
import shutil

# from models import mongo, init_db
from utils.analyze_website import analyze_website
from test_runner import run_tests, save_report

app = Flask(__name__, static_folder='static')
CORS(app, origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176", "http://localhost:5177", "http://localhost:5178"])

# File storage configuration
BASE_DIR = os.path.abspath(os.path.dirname(__file__))
UPLOADS_DIR = os.path.join(BASE_DIR, 'storage', 'uploads')
REPORTS_DIR = os.path.join(BASE_DIR, 'storage', 'reports')
SCREENSHOTS_DIR = os.path.join(BASE_DIR, 'storage', 'screenshots')

# Create storage directories if they don't exist
for directory in [UPLOADS_DIR, REPORTS_DIR, SCREENSHOTS_DIR]:
    os.makedirs(directory, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOADS_DIR
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'csv', 'json'}

load_dotenv()
app.config['MONGO_URI'] = os.getenv('MONGO_URI', 'mongodb://localhost:27017/ai_selenium')
print(f"MONGO_URI: {app.config['MONGO_URI']}")  # Debug print

# Initialize MongoDB
mongo = PyMongo(app)
print(f"MongoDB initialized: {mongo}")  # Debug print

# Test MongoDB connection
try:
    print(f"mongo.db: {mongo.db}")  # Debug print
    mongo.db.command('ping')
    print("✅ MongoDB connection successful!")
except Exception as e:
    print(f"❌ MongoDB connection failed: {e}")

app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET', 'your-secret-key')
jwt = JWTManager(app)

# File utility functions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_file(file, user_id, file_type='upload'):
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        timestamp = datetime.utcnow().strftime('%Y%m%d%H%M%S')
        unique_filename = f"{timestamp}_{filename}"
        
        if file_type == 'report':
            filepath = os.path.join(REPORTS_DIR, unique_filename)
        elif file_type == 'screenshot':
            filepath = os.path.join(SCREENSHOTS_DIR, unique_filename)
        else:
            filepath = os.path.join(UPLOADS_DIR, unique_filename)
        
        file.save(filepath)
        return {
            'file_id': unique_filename,
            'filename': filename,
            'size': os.path.getsize(filepath),
            'uploaded_at': datetime.utcnow(),
            'user_id': user_id
        }
    return None

@app.route('/')
def home():
    return send_from_directory('static', 'index.html')

@app.route("/api/register", methods=["POST"])
def register():
    try:
        data = request.get_json()
        print(f"Registration data: {data}")  # Debug log
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({"message": "Email and password required"}), 400

        if mongo.db.users.find_one({'email': email}):
            return jsonify({"message": "User already exists"}), 400

        hashed_password = generate_password_hash(password)
        user = {
            'email': email,
            'password': hashed_password,
            'created_at': datetime.utcnow()
        }
        result = mongo.db.users.insert_one(user)
        print(f"User created with ID: {result.inserted_id}")  # Debug log

        return jsonify({"message": "User created"}), 201
    except Exception as e:
        print(f"Registration error: {str(e)}")  # Debug log
        return jsonify({"message": "Registration failed", "error": str(e)}), 500

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = mongo.db.users.find_one({'email': email})
    if not user or not check_password_hash(user['password'], password):
        return jsonify({"message": "Invalid credentials"}), 401

    access_token = create_access_token(identity=str(user['_id']))
    return jsonify({"access_token": access_token}), 200

@app.route("/api/analyze", methods=["POST"])
@jwt_required()
def analyze():
    user_id = get_jwt_identity()
    data = request.get_json()
    url = data.get('url')

    if not url:
        return jsonify({"message": "URL required"}), 400

    recommendations = analyze_website(url)

    # Save test run
    test_run = {
        'user_id': user_id,
        'url': url,
        'status': 'PENDING',
        'created_at': datetime.utcnow()
    }
    test_run_id = mongo.db.test_runs.insert_one(test_run).inserted_id

    # Save recommendations
    for rec in recommendations:
        if 'error' not in rec:
            rec_doc = {
                'test_run_id': str(test_run_id),
                'element_type': rec['element_type'],
                'selector': rec['selector'],
                'action': rec['action'],
                'description': rec['description']
            }
            mongo.db.test_recommendations.insert_one(rec_doc)

    return jsonify({"test_run_id": str(test_run_id), "recommendations": recommendations}), 200

@app.route("/api/run_tests/<test_run_id>", methods=["POST"])
@jwt_required()
def run_tests_endpoint(test_run_id):
    user_id = get_jwt_identity()
    test_run = mongo.db.test_runs.find_one({'_id': ObjectId(test_run_id), 'user_id': user_id})
    if not test_run:
        return jsonify({"message": "Test run not found"}), 404

    recommendations = list(mongo.db.test_recommendations.find({'test_run_id': test_run_id}))
    recs = [{
        'element_type': r['element_type'],
        'selector': r['selector'],
        'action': r['action'],
        'description': r['description']
    } for r in recommendations]

    results = run_tests(test_run['url'], recs)
    report_path = save_report(test_run['url'], results, user_id)

    mongo.db.test_runs.update_one(
        {'_id': ObjectId(test_run_id)},
        {'$set': {'status': 'COMPLETED', 'report_path': report_path}}
    )

    return jsonify({"results": results, "report_path": report_path}), 200

@app.route("/api/reports")
@jwt_required()
def reports():
    user_id = get_jwt_identity()
    test_runs = list(mongo.db.test_runs.find({'user_id': user_id}))
    data = []
    for run in test_runs:
        if run.get('report_path') and os.path.exists(run['report_path']):
            with open(run['report_path']) as f:
                report_data = json.load(f)
                data.append({
                    'timestamp': run['created_at'].isoformat(),
                    'url': run['url'],
                    'summary': report_data.get('summary', {}),
                    'results': report_data.get('results', [])
                })
    return jsonify(data)

@app.route("/api/manual_test", methods=["POST"])
@jwt_required()
def manual_test():
    user_id = get_jwt_identity()
    data = request.get_json()

    manual_test = {
        'user_id': user_id,
        'name': data.get('name'),
        'description': data.get('description'),
        'steps': data.get('steps'),
        'expected_result': data.get('expectedResult'),
        'status': 'PENDING',
        'created_at': datetime.utcnow()
    }

    mongo.db.manual_tests.insert_one(manual_test)
    return jsonify({"message": "Manual test saved"}), 201

@app.route("/api/export_pdf", methods=["POST"])
@jwt_required()
def export_pdf():
    user_id = get_jwt_identity()
    data = request.get_json()
    test_data = data.get('testData', [])

    # Create PDF buffer
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        spaceAfter=30,
    )
    story.append(Paragraph("AI Selenium Test Report", title_style))
    story.append(Spacer(1, 12))

    # Summary
    if isinstance(test_data, list) and test_data:
        total_tests = len(test_data)
        passed_tests = sum(1 for r in test_data if r.get('status') == 'PASS')
        failed_tests = total_tests - passed_tests

        summary_data = [
            ['Total Tests', str(total_tests)],
            ['Passed', str(passed_tests)],
            ['Failed', str(failed_tests)],
            ['Success Rate', f"{(passed_tests/total_tests*100):.1f}%" if total_tests > 0 else "0%"]
        ]

        summary_table = Table(summary_data, colWidths=[200, 100])
        summary_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        story.append(summary_table)
        story.append(Spacer(1, 20))

    # Test Results
    if isinstance(test_data, list):
        story.append(Paragraph("Test Results", styles['Heading2']))
        story.append(Spacer(1, 12))

        results_data = [['Test', 'Status', 'Details']]
        for i, result in enumerate(test_data, 1):
            status = result.get('status', 'UNKNOWN')
            details = result.get('error', result.get('message', 'N/A'))
            results_data.append([f"Test {i}", status, str(details)[:50] + '...' if len(str(details)) > 50 else str(details)])

        results_table = Table(results_data, colWidths=[100, 80, 300])
        results_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        story.append(results_table)

    doc.build(story)
    buffer.seek(0)

    return buffer.getvalue(), 200, {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=test-report.pdf'
    }

@app.route("/api/metrics")
@jwt_required()
def metrics():
    user_id = get_jwt_identity()
    test_runs = list(mongo.db.test_runs.find({'user_id': user_id}))
    total = len(test_runs)
    completed = sum(1 for r in test_runs if r['status'] == 'COMPLETED')
    return {
        "total_runs": total,
        "completed": completed
    }

# File Management Endpoints
@app.route("/api/upload", methods=["POST"])
@jwt_required()
def upload_file():
    user_id = get_jwt_identity()
    
    if 'file' not in request.files:
        return jsonify({"message": "No file provided"}), 400
    
    file = request.files['file']
    file_type = request.form.get('file_type', 'upload')  # upload, report, screenshot
    
    if file.filename == '':
        return jsonify({"message": "No file selected"}), 400
    
    try:
        file_info = save_file(file, user_id, file_type)
        if not file_info:
            return jsonify({"message": "File type not allowed"}), 400
        
        # Store metadata in MongoDB
        file_doc = {
            'user_id': user_id,
            'file_id': file_info['file_id'],
            'original_filename': file_info['filename'],
            'file_type': file_type,
            'size': file_info['size'],
            'uploaded_at': datetime.utcnow()
        }
        mongo.db.files.insert_one(file_doc)
        
        return jsonify({
            "message": "File uploaded successfully",
            "file_id": file_info['file_id'],
            "filename": file_info['filename'],
            "size": file_info['size']
        }), 201
    except Exception as e:
        return jsonify({"message": "Upload failed", "error": str(e)}), 500

@app.route("/api/files", methods=["GET"])
@jwt_required()
def list_files():
    user_id = get_jwt_identity()
    file_type = request.args.get('type', None)  # Filter by type: upload, report, screenshot
    
    try:
        query = {'user_id': user_id}
        if file_type:
            query['file_type'] = file_type
        
        files = list(mongo.db.files.find(query).sort('uploaded_at', -1))
        
        file_list = []
        for f in files:
            file_list.append({
                'file_id': f['file_id'],
                'filename': f['original_filename'],
                'file_type': f['file_type'],
                'size': f['size'],
                'uploaded_at': f['uploaded_at'].isoformat()
            })
        
        return jsonify(file_list), 200
    except Exception as e:
        return jsonify({"message": "Failed to fetch files", "error": str(e)}), 500

@app.route("/api/files/<file_id>", methods=["GET"])
@jwt_required()
def download_file(file_id):
    user_id = get_jwt_identity()
    
    try:
        file_doc = mongo.db.files.find_one({'file_id': file_id, 'user_id': user_id})
        if not file_doc:
            return jsonify({"message": "File not found"}), 404
        
        # Determine file path
        if file_doc['file_type'] == 'report':
            filepath = os.path.join(REPORTS_DIR, file_id)
        elif file_doc['file_type'] == 'screenshot':
            filepath = os.path.join(SCREENSHOTS_DIR, file_id)
        else:
            filepath = os.path.join(UPLOADS_DIR, file_id)
        
        if not os.path.exists(filepath):
            return jsonify({"message": "File not found on disk"}), 404
        
        return send_file(filepath, as_attachment=True, download_name=file_doc['original_filename'])
    except Exception as e:
        return jsonify({"message": "Download failed", "error": str(e)}), 500

@app.route("/api/files/<file_id>", methods=["DELETE"])
@jwt_required()
def delete_file(file_id):
    user_id = get_jwt_identity()
    
    try:
        file_doc = mongo.db.files.find_one({'file_id': file_id, 'user_id': user_id})
        if not file_doc:
            return jsonify({"message": "File not found"}), 404
        
        # Determine file path
        if file_doc['file_type'] == 'report':
            filepath = os.path.join(REPORTS_DIR, file_id)
        elif file_doc['file_type'] == 'screenshot':
            filepath = os.path.join(SCREENSHOTS_DIR, file_id)
        else:
            filepath = os.path.join(UPLOADS_DIR, file_id)
        
        # Delete file from disk
        if os.path.exists(filepath):
            os.remove(filepath)
        
        # Delete metadata from MongoDB
        mongo.db.files.delete_one({'file_id': file_id})
        
        return jsonify({"message": "File deleted successfully"}), 200
    except Exception as e:
        return jsonify({"message": "Delete failed", "error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)
