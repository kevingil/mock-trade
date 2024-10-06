from flask import Flask
from flask_cors import CORS
from app.config import setting
from app.models.schema import db
from app.models.user import User
from sqlalchemy import text


def create_app() -> Flask:
    app = Flask(__name__)
    CORS(app)
    app.debug = True
    app.config.from_object(setting)
    register_blueprints(app)
    db_connection_test(app)

    return app


def register_blueprints(app: Flask):
    from app.controllers.ticket import tickets
    app.register_blueprint(tickets)

    from app.controllers.search import search
    app.register_blueprint(search)
    
    from app.controllers.transaction import trans
    app.register_blueprint(trans)
    
    from app.controllers.user import user
    app.register_blueprint(user)



def db_connection_test(app: Flask):
    db.init_app(app)

    with app.app_context():
        try:
            result = db.session.execute(text('SELECT 1'))
            print(f"Database connection test succeeded, result: {result.fetchone()}")

            user_count = db.session.query(User).count()
            print(f"Number of users in the database: {user_count}")

        except Exception as e:
            print(f"Database connection test failed: {e}")

