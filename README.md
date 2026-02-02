# Eco-Secure Store CTF Challenge

A vulnerable e-commerce web application for CTF competitions featuring Client-Side Template Injection (CSTI).

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for local development)

### Running with Docker (Production)

```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

The application will be available at `http://localhost:3000`

### Running Locally (Development)

```bash
# Install dependencies
npm install

# Start the server
npm start
```

## Challenge Overview

**Category**: Web Exploitation  
**Difficulty**: Medium  
**Vulnerability**: Client-Side Template Injection (CSTI)  

Players must:
1. Discover the support ticket system
2. Identify the AngularJS CSTI vulnerability
3. Craft a payload to exfiltrate admin session cookies
4. Use the stolen cookie to access the admin panel
5. Retrieve the flag

## Default Credentials

- **Guest**: `guest` / `guest`
- **Admin**: `admin` / `admin` (protected by session cookie)

## Security Notes

This application is **intentionally vulnerable** for educational purposes. Do not deploy in production environments.

## Files

- `server.js` - Express backend
- `public/` - Frontend assets
- `admin-bot.js` - Simulated admin browser
- `.env` - Configuration (not included, see `.env.example`)

## License

MIT
