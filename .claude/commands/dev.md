# Start Local Development Environment

Start the Firebase emulators and Vite dev server for local development.

## Steps

1. Gracefully stop any existing Firebase emulators and Vite processes (SIGTERM first, then SIGKILL)
2. Start Firebase emulators (auth + dataconnect + functions) in background
3. Start Vite dev server in background
4. Wait for startup and display status

## Commands

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
