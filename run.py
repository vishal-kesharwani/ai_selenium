"""
AI Selenium Framework - Main Entry Point
Run this file to start the Flask server
"""
import os
import sys

# Add the app directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from backend.app import create_app

if __name__ == "__main__":
    app = create_app()
    app.run(port=5000, debug=True)
