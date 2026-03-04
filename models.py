from flask_pymongo import PyMongo
from datetime import datetime

mongo = PyMongo()

def init_db(app):
    mongo.init_app(app)
    print(f"MongoDB initialized with URI: {app.config.get('MONGO_URI')}")

# Collections will be created dynamically