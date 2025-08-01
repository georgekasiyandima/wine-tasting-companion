# Wine Tasting Companion Backend

A Node.js, Express, and SQLite backend API for the Wine Tasting Companion application.

## Features

- **RESTful API** for wine cellar management
- **SQLite Database** for data persistence
- **JWT Authentication** for secure access
- **Input Validation** using express-validator
- **Rate Limiting** to prevent abuse
- **CORS Support** for cross-origin requests
- **Security Headers** with Helmet
- **Error Handling** with proper HTTP status codes

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp env.example .env
   ```

4. Update the `.env` file with your configuration:
   ```env
   PORT=3001
   NODE_ENV=development
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   DB_PATH=./wine_companion.db
   CORS_ORIGIN=http://localhost:3000
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   ```

## Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:3001` (or the port specified in your `.env` file).

## API Endpoints

### Health Check
- `GET /health` - Check if the API is running

### Authentication
- `POST /api/auth/demo-login` - Demo login for development

### Cellars
- `GET /api/cellars` - Get all cellars for the authenticated user
- `GET /api/cellars/:cellarId/wines` - Get all wines in a cellar
- `POST /api/cellars/:cellarId/wines` - Add wine to a cellar
- `DELETE /api/cellars/:cellarId/wines/:wineId` - Delete wine from a cellar

## Database Schema

### Users Table
- `id` (TEXT, PRIMARY KEY)
- `email` (TEXT, UNIQUE)
- `displayName` (TEXT)
- `photoURL` (TEXT)
- `preferences` (TEXT)
- `createdAt` (INTEGER)
- `updatedAt` (INTEGER)

### Wine Cellars Table
- `id` (TEXT, PRIMARY KEY)
- `userId` (TEXT, FOREIGN KEY)
- `name` (TEXT)
- `description` (TEXT)
- `location` (TEXT)
- `temperature` (REAL)
- `humidity` (REAL)
- `capacity` (INTEGER)
- `createdAt` (INTEGER)
- `updatedAt` (INTEGER)

### Cellar Wines Table
- `id` (TEXT, PRIMARY KEY)
- `cellarId` (TEXT, FOREIGN KEY)
- `userId` (TEXT, FOREIGN KEY)
- `name` (TEXT)
- `region` (TEXT)
- `vintage` (TEXT)
- `quantity` (INTEGER)
- `purchasePrice` (REAL)
- `currentValue` (REAL)
- `grape` (TEXT)
- `winery` (TEXT)
- `drinkByDate` (INTEGER)
- `notes` (TEXT)
- `isSustainable` (BOOLEAN)
- `addedDate` (INTEGER)
- `purchaseDate` (INTEGER)
- `storageLocation` (TEXT)
- `agingPotential` (INTEGER)
- `isOpened` (BOOLEAN)
- `openedDate` (INTEGER)
- `timestamp` (INTEGER)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description"
}
```

## Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Prevents abuse
- **Input Validation**: Sanitizes user input
- **JWT Authentication**: Secure token-based auth

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 3001 |
| `NODE_ENV` | Environment | development |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration | 7d |
| `DB_PATH` | SQLite database path | ./wine_companion.db |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:3000 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

## License

MIT License 