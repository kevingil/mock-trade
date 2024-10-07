# Mock stock trading app

An app to allow you to trade stocks and options without real money.


### Getting Started

We first need a blank postgres instance running. If you have Docker, you can start one with the compose file, or you can modify the .env files to provide your own.

```bash
docker compose up -d 
```


Setup enviroments (optional)

Flask and React will connect to the default docker instance `postgres://postgres:postgres@localhost:54322/postgres`. If you instead want to use your own docker provider, mofidy the connection strings here:


```bash
# frontend/.env
POSTGRES_URL=postgresql://***

# backend/.env
POSTGRES_URL=postgresql://***
```

Setup frontend & database migrations

```bash
cd frontend/
pnpm install
# Double check your blank postgres
# instance is running
pnpm db:migrate
pnpm db:seed
```

This will create the following user data:

- User: `test@test.com`
- Name: `Test`
- Password: `admin123`
- Tickers: NASDAQ stock symbols cache


Now build and run the backend

```bash
cd backend
python -m venv venv/
source venv/bin/activate
pip install -r requirements.txt
# Double check the database
# has been built via pnpm db:migrate
flask run
```


Finally, run the frontend

```
```bash
cd frontend/
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to access the app.

