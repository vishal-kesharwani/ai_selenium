# Local MongoDB Setup Guide

## Option 1: Install MongoDB Community Edition (Recommended)

### Step 1: Download MongoDB
1. Go to https://www.mongodb.com/try/download/community
2. Select:
   - **Version**: Latest (e.g., 7.0)
   - **Platform**: Windows
   - **Package**: .msi (Windows Installer)
3. Download the `.msi` file

### Step 2: Install MongoDB
1. Run the downloaded `.msi` file
2. Follow the installation wizard:
   - Choose "Complete" setup
   - Accept the default installation path: `C:\Program Files\MongoDB\Server\7.0`
   - Uncheck "Install MongoDB Compass" (optional)
   - Check "Run the MongoDB server as a Windows Service"
   - Click "Install"

### Step 3: Verify Installation
Open PowerShell and run:
```powershell
mongod --version
```

### Step 4: Start MongoDB Service
MongoDB should start automatically as a Windows Service. To verify:
```powershell
Get-Service MongoDB
```

If it's not running:
```powershell
Start-Service MongoDB
```

To stop MongoDB:
```powershell
Stop-Service MongoDB
```

---

## Option 2: Use MongoDB via Docker

If you have Docker installed:

```powershell
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

This will run MongoDB in a container on port 27017.

---

## Option 3: Use MongoDB Atlas but Fix SSL

If you prefer to keep using MongoDB Atlas, add this to your connection string:
```
mongodb+srv://user1:Vishal7972@cluster0.y6npu2z.mongodb.net/ai_selenium?appName=Cluster0&tlsInsecure=true
```

---

## Testing Connection

Once MongoDB is running locally, test the connection:

```powershell
mongosh "mongodb://localhost:27017"
```

You should see `>` prompt. Type `exit` to quit.

---

## Default Connection

Your app is now configured to connect to:
```
mongodb://localhost:27017/ai_selenium
```

No authentication required for local development!
