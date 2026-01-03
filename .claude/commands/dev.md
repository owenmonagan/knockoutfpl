# Start Local Development Environment

Start the Firebase emulators and Vite dev server for local development.

## Options

- **Reset Data Connect**: Delete `./dataconnect-data/` to start with a fresh database

## Steps

1. (Optional) Delete Data Connect data directory for fresh database
2. Gracefully stop any existing Firebase emulators and Vite processes
3. Start Firebase emulators (auth + dataconnect + functions) in background
4. Start Vite dev server in background
5. Wait for startup and display status

## Commands

### Reset Data Connect (Optional)
```bash
# Delete the dataconnect-data directory for a completely fresh database
rm -rf ./dataconnect-data/
```

### Start Environment
```bash
# Graceful shutdown first (allows cleanup), then force kill if needed
pkill -TERM -f "firebase.*emulators" 2>/dev/null; sleep 1
pkill -TERM -f "vite" 2>/dev/null; sleep 1
# Force kill any stragglers
lsof -ti:5173,4000,9099,9399,4400,5001 2>/dev/null | xargs kill -9 2>/dev/null

# Start emulators
./node_modules/.bin/firebase emulators:start --only auth,dataconnect,functions --project knockoutfpl-dev

# Start dev server
npm run dev
```

## Expected Result

| Service | URL |
|---------|-----|
| App | http://localhost:5173/ |
| Emulator UI | http://127.0.0.1:4000/ |
| Auth Emulator | 127.0.0.1:9099 |
| Data Connect | 127.0.0.1:9399 |
| Functions | 127.0.0.1:5001 |

## Notes

- The `dataconnect-data/` directory contains the embedded PostgreSQL database
- Deleting it gives you a completely fresh database with empty tables
- The emulator automatically recreates the directory and applies the schema on startup
