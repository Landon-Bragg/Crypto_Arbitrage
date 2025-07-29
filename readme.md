## Overview

This is a cryptocurrency arbitrage monitoring application built with React frontend and Express.js backend. The system tracks price differences between cryptocurrency exchanges (Kraken, Coinbase, Binance US, and Gemini) for multiple cryptocurrencies (Bitcoin, Ethereum, Cardano, Solana, Polkadot, Chainlink, Ripple, and Cosmos), identifying arbitrage opportunities where the same asset has different prices across exchanges. The application now features user authentication, a freemium model with rate limiting, and advertisement integration for monetization.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and bundling
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack React Query for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and dark theme support

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ES modules
- **API Design**: RESTful endpoints for arbitrage data and price updates
- **Data Storage**: In-memory storage with interface for future database integration
- **External APIs**: Integration with Kraken and Coinbase exchange APIs

## Key Components

### Core Services
- **Exchange Service** (`server/services/exchangeService.ts`): Handles fetching prices from Kraken, Coinbase, Binance US, and Gemini APIs, calculates arbitrage opportunities across all exchange pairs
- **Storage Interface** (`server/storage.ts`): Abstracts data persistence with current in-memory implementation and interface ready for database integration
- **Route Handler** (`server/routes.ts`): Defines API endpoints for retrieving arbitrage opportunities, latest prices, and manual price updates

### Frontend Components
- **Arbitrage Table**: Displays opportunities with coin icons, exchange badges, pricing data, and spread percentages for all supported currencies
- **Live Prices Panel**: Real-time display of current prices from all exchanges, grouped by cryptocurrency with spread calculations
- **Filter Sidebar**: Provides filtering by cryptocurrency type (BTC, ETH, ADA, SOL, DOT) and minimum spread threshold
- **Alert System**: Real-time notifications for new arbitrage opportunities above configured thresholds
- **Auto-refresh**: Configurable automatic data refreshing every 15 seconds

### Data Models
- **Arbitrage Opportunities**: Tracks buy/sell exchanges, prices, spreads, and timestamps across all supported exchange pairs
- **Exchange Prices**: Stores latest price data from each exchange for each supported coin (8 cryptocurrencies, 4 exchanges)
- **Statistics**: Aggregated metrics about active opportunities and highest spreads
- **Users**: Stores user authentication data including username, email, password hash, and premium status
- **Authentication**: JWT token-based authentication with bcrypt password hashing

### Authentication & Premium Features
- **User Registration/Login**: Secure authentication with JWT tokens and bcrypt password hashing
- **Freemium Model**: Free users get slower updates (15s intervals), premium users get faster updates (5s intervals)
- **Rate Limiting**: Free users limited to 4 requests/minute, premium users get 20 requests/minute
- **Advertisement Integration**: Ad banners displayed for free users to encourage premium upgrades

## Data Flow

1. **Price Collection**: Exchange service periodically fetches prices from Kraken, Coinbase, Binance US, and Gemini APIs
2. **Opportunity Detection**: System compares prices across all possible exchange pairs to identify arbitrage opportunities
3. **Data Storage**: Opportunities and prices stored in memory with cleanup of old data
4. **API Exposure**: REST endpoints serve filtered arbitrage data to frontend
5. **Real-time Updates**: Frontend polls API every 15 seconds for latest opportunities and live prices
6. **User Interaction**: Filtering and alert preferences modify data presentation

## External Dependencies

### Backend Dependencies
- **@tanstack/react-query**: Server state management and caching
- **axios**: HTTP client for exchange API calls
- **drizzle-orm**: Database ORM (configured for future PostgreSQL integration)
- **@neondatabase/serverless**: PostgreSQL client for serverless environments
- **connect-pg-simple**: PostgreSQL session store (not currently used)

### Frontend Dependencies
- **@radix-ui/***: Headless UI component primitives
- **shadcn/ui**: Pre-built accessible components
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight client-side routing
- **react-icons**: Cryptocurrency and general icons

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across frontend and backend
- **Drizzle Kit**: Database migration and schema management tools

## Deployment Strategy

### Build Process
- **Frontend**: Vite builds React app to `dist/public` directory
- **Backend**: esbuild bundles Express server to `dist/index.js`
- **Production**: Single Node.js process serves both API and static files

### Environment Configuration
- **Development**: Vite dev server with hot reload, Express API server
- **Production**: Bundled Express server serves built React app from public directory
- **Database**: Configured for PostgreSQL via DATABASE_URL environment variable

### Database Setup
- **Schema**: Defined in `shared/schema.ts` using Drizzle ORM
- **Migrations**: Generated and applied via `drizzle-kit push` command
- **Tables**: `arbitrage_opportunities` and `exchange_prices` with proper indexing

The application is designed to be easily deployable on platforms like Replit, with automatic database provisioning and a single-command build process that handles both frontend and backend compilation.
