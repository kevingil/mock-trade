import { db } from './drizzle';
import { users, teams, teamMembers, tickers } from './schema';
import { hashPassword } from '@/lib/auth/session';

// Fetch tickers from the NASDAQ API
// for fast, multi value search queries
const DATA_URL = 'https://api.nasdaq.com/api/screener/stocks?tableonly=true&limit=25&offset=0&download=true';

interface TickerRow {
  symbol: string;
  name: string;
  country: string;
  ipoyear: string;
  industry: string;
  sector: string;
}

async function seed() {
  // Create initial user
  const email = 'test@test.com';
  const password = 'admin123';
  const name = 'Test';
  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(users)
    .values([
      {
        email: email,
        name: name,
        passwordHash: passwordHash,
        role: "owner",
      },
    ])
    .returning();

  console.log('Initial user created.');

  const [team] = await db
    .insert(teams)
    .values({
      name: 'Test Team',
    })
    .returning();

  await db.insert(teamMembers).values({
    teamId: team.id,
    userId: user.id,
    role: 'owner',
  });

  // Fetch tickers data
  const response = await fetch(DATA_URL);
  const json = await response.json();

  // Extract rows and prepare data for insertion
  const tickerData = json.data.rows.map((row: TickerRow) => ({
    symbol: row.symbol,
    name: row.name,
    country: row.country,
    ipoyear: row.ipoyear,
    industry: row.industry,
    sector: row.sector,
  }));

  // Insert ticker data into the database
  for (const ticker of tickerData) {
    console.log(`Inserting ticker: ${ticker.symbol}`);
    await db.insert(tickers).values(ticker);
  }

  console.log('Ticker data seeded.');
}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });
