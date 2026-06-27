# TierCore - Minecraft PvP Ranking Platform

A complete competitive PvP ranking platform inspired by MCTiers.com. Built with Next.js 15, TypeScript, Tailwind CSS, PostgreSQL, and Discord.js.

## Features

### Core Platform
- **10-Tier Ranking System**: LT5 → HT1 with configurable ELO thresholds
- **Automated ELO Calculation**: Glicko-inspired rating system with upset multipliers
- **Real-Time Updates**: WebSocket-based live leaderboard and match updates
- **Match Submission & Approval**: Staff-reviewed match workflow
- **Player Profiles**: Detailed statistics, match history, achievements, ranking graphs
- **Seasonal Leaderboards**: Resets and soft ELO adjustments between seasons
- **Regional & Global Rankings**: Filter by region and game mode

### Administration
- **Admin Dashboard**: Full platform management
- **Tier Configuration**: Edit tier names, colors, ELO ranges live
- **Season Management**: Create, activate, and archive seasons
- **Player Management**: Edit, ban, or investigate players
- **Moderator Tools**: Match approval, anti-cheat flags, audit logs
- **Role-Based Access**: USER, MODERATOR, ADMIN, SUPER_ADMIN permissions

### Discord Integration
- **Slash Commands**: `/rank`, `/leaderboard`, `/submit`, `/player`, `/tiers`, `/stats`, `/help`
- **Match Submission**: Submit results directly from Discord
- **Approval Workflow**: Approve/reject matches with buttons
- **Real-Time Notifications**: Match updates pushed to Discord

### API
- **RESTful API**: Full CRUD for players, matches, leaderboard
- **API Documentation**: Built-in docs at `/api/docs`
- **API Key Authentication**: Secure endpoint access

## Tech Stack

| Technology | Purpose |
|---|---|
| Next.js 15 | React framework with App Router |
| TypeScript | Type safety |
| Tailwind CSS | Utility-first styling |
| PostgreSQL | Primary database |
| Prisma | ORM with migrations |
| NextAuth | Authentication (credentials + Discord) |
| Socket.io | Real-time WebSocket updates |
| Discord.js | Discord bot framework |
| Docker | Containerized deployment |
| Zod | Schema validation |

## Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Docker (optional)

### Local Development

```bash
# Clone and install
git clone <repo-url>
cd tiercore
npm install

# Set up environment
cp .env.example .env
# Edit .env with your database URL and secrets

# Set up database
npx prisma generate
npx prisma db push
npm run prisma:seed

# Start dev server
npm run dev
```

Visit `http://localhost:3000`

### Docker Deployment

```bash
# Start all services
docker compose up -d

# Run database migrations
docker compose exec app npx prisma db push
docker compose exec app npm run prisma:seed
```

### Discord Bot

```bash
# Set Discord credentials in .env:
# DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_BOT_TOKEN, DISCORD_GUILD_ID

# Run the bot
npm run bot:dev
```

## Default Admin Login

- **Email**: admin@tiercore.com
- **Password**: admin123

## Tier System

| Tier | Name | ELO Range |
|---|---|---|
| LT5 | Low Tier 5 | 0–399 |
| LT4 | Low Tier 4 | 400–699 |
| LT3 | Low Tier 3 | 700–999 |
| LT2 | Low Tier 2 | 1,000–1,299 |
| LT1 | Low Tier 1 | 1,300–1,599 |
| HT5 | High Tier 5 | 1,600–1,899 |
| HT4 | High Tier 4 | 1,900–2,199 |
| HT3 | High Tier 3 | 2,200–2,499 |
| HT2 | High Tier 2 | 2,500–2,799 |
| HT1 | High Tier 1 | 2,800+ |

All tier configurations are editable from the admin panel at `/admin/tiers`.

## Project Structure

```
tiercore/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Homepage
│   │   ├── layout.tsx            # Root layout
│   │   ├── leaderboard/          # Global rankings
│   │   ├── player/[id]/          # Player profiles
│   │   ├── matches/              # Match listing & submission
│   │   ├── admin/                # Admin dashboard & config
│   │   ├── moderator/            # Moderation tools
│   │   ├── auth/                 # Authentication pages
│   │   └── api/                  # REST API routes
│   ├── components/
│   │   ├── layout/               # Header, Footer, Providers
│   │   ├── ui/                   # Reusable UI components
│   │   ├── leaderboard/          # Leaderboard components
│   │   └── player/               # Player profile components
│   ├── lib/
│   │   ├── elo.ts                # ELO calculation engine
│   │   ├── auth.ts               # Authentication config
│   │   ├── prisma.ts             # Database client
│   │   ├── socket.ts             # WebSocket server
│   │   ├── utils.ts              # Utility functions
│   │   └── permissions.ts        # Role-based permissions
│   └── types/                    # TypeScript types
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── seed.ts                   # Seed data
├── discord-bot/
│   ├── index.ts                  # Discord.js bot
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml
├── Dockerfile
└── README.md
```

## API Endpoints

| Method | Path | Description |
|---|---|---|
| GET | `/api/leaderboard` | Global leaderboard |
| GET | `/api/players` | List all players |
| POST | `/api/players` | Create player |
| GET | `/api/players/:id` | Player profile |
| GET | `/api/matches` | Recent matches |
| POST | `/api/matches` | Submit match |
| POST | `/api/matches/:id` | Approve/reject match |
| GET | `/api/tiers` | Tier configurations |
| GET | `/api/seasons` | Season info |
| GET | `/api/docs` | API documentation |

## Real-Time Events

Connect via Socket.io at the server path `/api/socketio`:

- `leaderboard:update` — Leaderboard changed
- `player:update` — Player stats updated
- `match:update` — Match status changed
- `notification` — Global notification

## License

MIT
