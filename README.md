# Friends Online App - Azure Deployment Guide

## Setup Instructions

### Prerequisites
- Node.js 14+ installed locally
- MongoDB (local or MongoDB Atlas)
- Azure App Service

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create `.env` file (copy from .env.example):**
   ```bash
   MONGODB_URL=mongodb://localhost:27017/friendsDB
   PORT=3000
   ```

3. **Start server:**
   ```bash
   npm start
   ```

4. **Visit:** `http://localhost:3000`

### Deploying to Azure

#### Option 1: MongoDB Atlas (Recommended for Azure)

1. Create a free cluster at https://www.mongodb.com/cloud/atlas
2. Get your connection string: `mongodb+srv://username:password@cluster.mongodb.net/friendsDB`
3. In Azure Portal → App Service → Configuration → Application settings:
   - Add: `MONGODB_URL` = your connection string
   - Azure automatically sets `PORT`

4. Redeploy your app (push to GitHub)

#### Option 2: Local MongoDB

If using local MongoDB, you'll need to:
- Install MongoDB locally and run it
- OR use MongoDB Atlas (recommended)

### Security Tips

- ⚠️ **Never commit `.env` file** (it's in .gitignore)
- Store secrets in Azure Key Vault for production
- Use connection pooling for databases

### Troubleshooting

**App shows "Application Error":**
1. Check Azure Portal → App Service → Logs → Application Logs
2. Visit `https://your-app.azurewebsites.net/health` to check status
3. Ensure `MONGODB_URL` environment variable is set in Azure

**Health Check Endpoint:**
```
GET /health
```
Returns:
```json
{
  "status": "OK",
  "timestamp": "2024-03-27T...",
  "database": "Connected" or "Disconnected"
}
```

**Database Not Connected:**
- The app will still run
- Check your `MONGODB_URL` environment variable
- Verify MongoDB instance is accessible

### API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/online-users` | Get all online users |
| POST | `/login` | Login user |
| POST | `/logout` | Logout user |
| GET | `/` | Home page |

### Environment Variables

```
MONGODB_URL     - MongoDB connection string
PORT            - Server port (auto-set by Azure)
NODE_ENV        - Environment (production/development)
```

### Contact & Support

For issues, check Azure Application Insights or app logs.
