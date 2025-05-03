from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate

from auth.models import db        # ✅ re-use this db instance
from auth.routes import auth_bp
from predict.routes import predict_bp

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your_secret_key'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

CORS(app)

db.init_app(app)                 # ✅ only do init_app, no re-declare
migrate = Migrate(app, db)

app.register_blueprint(predict_bp, url_prefix='/api/predict')
app.register_blueprint(auth_bp, url_prefix='/api/auth')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
