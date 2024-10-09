import os

DEBUG = True

# PostgreSQL database URL
# defaults to docker local Postgres
SQLALCHEMY_DATABASE_URI = os.environ.get("DATABASE_URL") or 'postgresql://postgres:postgres@localhost:54322/postgres'
