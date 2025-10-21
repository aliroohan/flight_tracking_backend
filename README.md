# FlightAware Backend API

Backend API server for the FlightAware flight tracking system.

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/flightaware
PORT=5000
NODE_ENV=development
```

3. Start MongoDB (if local):
```bash
mongod
```

4. Run the server:
```bash
npm run dev
```

## API Endpoints

### Flight APIs
- `POST /api/flights` - Create flight
- `GET /api/flights` - Get all flights
- `GET /api/flights/active` - Get active flights
- `GET /api/flights/:flightNumber` - Get specific flight
- `PUT /api/flights/:flightNumber/status` - Update status
- `DELETE /api/flights/:flightNumber` - Delete flight

### Tracking APIs
- `POST /api/tracking/ingest` - Ingest tracking data
- `POST /api/tracking/ingest/batch` - Batch ingest
- `GET /api/tracking/:flightNumber/location` - Get location
- `GET /api/tracking/:flightNumber/path` - Get flight path
- `GET /api/tracking/active` - Get active tracking
- `POST /api/tracking/:flightNumber/complete` - Complete flight

### Log APIs
- `GET /api/logs` - Get all logs
- `GET /api/logs/:flightNumber` - Get flight log
- `GET /api/logs/:flightNumber/all` - Get all logs for flight
- `GET /api/logs/:flightNumber/statistics` - Get statistics
- `DELETE /api/logs/:id` - Delete log

## Database Models

### Flight
Basic flight information and schedule

### FlightTracking
Real-time tracking data from receivers

### FlightLog
Archived completed flights with statistics

## Environment Variables

- `MONGODB_URI` - MongoDB connection string
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)

## Scripts

- `npm start` - Start server
- `npm run dev` - Start with nodemon (development)

