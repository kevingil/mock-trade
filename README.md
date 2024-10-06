# Mock stock trading app

An app to allow you to trade stocks and options without real money.


### Getting Started

We first need a blank postgres instance running. If you have Docker, you can start one with the compose file, or you can modify the .env files to provide your own.

```bash
docker compose up -d 
```
this will allow us to use this connection string: `postgres://postgres:postgres@localhost:54322/postgres`


Setup enviroments

If you want to use your own Postgres instance, modify these files.

```bash
# frontend/.env
POSTGRES_URL=postgresql://***
```

```bash
# backend/.env
POSTGRES_URL=postgresql://***
```

Install dependencies

```bash
cd frontend
pnpm install
```
```bash
cd backend
python -m venv venv/
source venv/bin/activate
pip install -r requirements.txt
```

Building database

To run migrations, run these commands:

```bash
cd frontend/
pnpm db:migrate
pnpm db:seed
```

This will create the following user data:

- User: `test@test.com`
- Name: `Test`
- Password: `admin123`

And a tickers table with all NASDAQ stock symbols.


Finally, run the apps.

```bash
cd backend/
flask run
```
```bash
cd frontend/
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to access the app.

