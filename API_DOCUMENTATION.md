# FlightAware API Documentation

Complete API reference for the FlightAware flight tracking system.

## Base URL
```
http://localhost:5000/api
```

## Response Format

All API responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "message": "Success message",
  "data": {...}
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error message",
  "error": "Detailed error"
}
```

---

## Flight Endpoints

### 1. Create Flight

Create a new flight schedule.

**Endpoint:** `POST /api/flights`

**Request Body:**
```json
{
  "flightNumber": "AA123",
  "airline": "American Airlines",
  "aircraftType": "Boeing 737",
  "origin": {
    "airport": "JFK",
    "city": "New York",
    "country": "USA",
    "coordinates": {
      "latitude": 40.6413,
      "longitude": -73.7781
    }
  },
  "destination": {
    "airport": "LAX",
    "city": "Los Angeles",
    "country": "USA",
    "coordinates": {
      "latitude": 33.9416,
      "longitude": -118.4085
    }
  },
  "scheduledDeparture": "2025-10-22T08:00:00Z",
  "scheduledArrival": "2025-10-22T14:30:00Z",
  "status": "scheduled"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "Flight created successfully",
  "data": {
    "_id": "...",
    "flightNumber": "AA123",
    ...
  }
}
```

---

### 2. Get All Flights

Retrieve all flights with optional filtering.

**Endpoint:** `GET /api/flights`

**Query Parameters:**
- `status` - Filter by flight status
- `airline` - Filter by airline (partial match)
- `origin` - Filter by origin airport code
- `destination` - Filter by destination airport code

**Example:** `GET /api/flights?status=in-flight&airline=American`

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 5,
  "data": [...]
}
```

---

### 3. Get Flight by Number

Retrieve specific flight details.

**Endpoint:** `GET /api/flights/:flightNumber`

**Example:** `GET /api/flights/AA123`

**Response:** `200 OK`

---

### 4. Get Active Flights

Retrieve all currently active flights.

**Endpoint:** `GET /api/flights/active`

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 3,
  "data": [...]
}
```

---

### 5. Update Flight Status

Update flight status and actual times.

**Endpoint:** `PUT /api/flights/:flightNumber/status`

**Request Body:**
```json
{
  "status": "in-flight",
  "actualDeparture": "2025-10-22T08:15:00Z"
}
```

**Response:** `200 OK`

---

### 6. Delete Flight

Delete a flight.

**Endpoint:** `DELETE /api/flights/:flightNumber`

**Response:** `200 OK`

---

## Tracking Endpoints

### 1. Ingest Tracking Data

Ingest a single tracking data point from a radio receiver.

**Endpoint:** `POST /api/tracking/ingest`

**Request Body:**
```json
{
  "flightNumber": "AA123",
  "position": {
    "latitude": 35.5678,
    "longitude": -95.1234,
    "altitude": 35000
  },
  "speed": 450,
  "heading": 270,
  "verticalSpeed": 0,
  "receiverInfo": {
    "receiverId": "RX-001",
    "receiverLocation": {
      "latitude": 35.5000,
      "longitude": -95.0000
    },
    "signalStrength": 85
  },
  "timestamp": "2025-10-22T10:30:00Z",
  "squawk": "1200"
}
```

**Field Descriptions:**
- `flightNumber` - Flight identifier (required)
- `position.latitude` - GPS latitude (-90 to 90)
- `position.longitude` - GPS longitude (-180 to 180)
- `position.altitude` - Altitude in feet
- `speed` - Ground speed in knots
- `heading` - Direction of travel (0-360 degrees, 0=North)
- `verticalSpeed` - Rate of climb/descent (ft/min, negative = descending)
- `receiverInfo.receiverId` - Identifier of the radio receiver
- `receiverInfo.receiverLocation` - Location of receiver
- `receiverInfo.signalStrength` - Signal quality (0-100)
- `timestamp` - Time when signal was received (optional, defaults to now)
- `squawk` - Transponder code (optional)

**Response:** `201 Created`

---

### 2. Ingest Batch Tracking Data

Ingest multiple tracking points at once.

**Endpoint:** `POST /api/tracking/ingest/batch`

**Request Body:**
```json
{
  "flightNumber": "AA123",
  "trackingDataArray": [
    {
      "position": {...},
      "speed": 250,
      "heading": 270,
      "verticalSpeed": 1500,
      "receiverInfo": {...},
      "timestamp": "2025-10-22T08:30:00Z"
    },
    {
      "position": {...},
      "speed": 350,
      "heading": 270,
      "verticalSpeed": 2000,
      "receiverInfo": {...},
      "timestamp": "2025-10-22T08:35:00Z"
    }
  ]
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "message": "15 tracking data points ingested successfully",
  "count": 15,
  "data": [...]
}
```

---

### 3. Get Flight Location

Get flight position at a specific time or current position.

**Endpoint:** `GET /api/tracking/:flightNumber/location`

**Query Parameters:**
- `timestamp` - Optional. Get position at specific time (ISO 8601 format)

**Examples:**
- Current position: `GET /api/tracking/AA123/location`
- Historical position: `GET /api/tracking/AA123/location?timestamp=2025-10-22T10:00:00Z`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "flightInfo": {
      "flightNumber": "AA123",
      "airline": "American Airlines",
      "aircraftType": "Boeing 737",
      "origin": {...},
      "destination": {...},
      "status": "in-flight"
    },
    "currentPosition": {
      "latitude": 35.5678,
      "longitude": -95.1234,
      "altitude": 35000,
      "speed": 450,
      "heading": 270,
      "verticalSpeed": 0,
      "timestamp": "2025-10-22T10:30:00Z"
    },
    "receiverInfo": {
      "receiverId": "RX-001",
      "receiverLocation": {...},
      "signalStrength": 85
    }
  }
}
```

---

### 4. Get Flight Path

Get complete flight path or path within time range.

**Endpoint:** `GET /api/tracking/:flightNumber/path`

**Query Parameters:**
- `startTime` - Optional. Start of time range
- `endTime` - Optional. End of time range

**Example:** `GET /api/tracking/AA123/path?startTime=2025-10-22T08:00:00Z&endTime=2025-10-22T14:30:00Z`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "flightInfo": {...},
    "path": [
      {
        "latitude": 40.6413,
        "longitude": -73.7781,
        "altitude": 5000,
        "speed": 250,
        "heading": 270,
        "timestamp": "2025-10-22T08:20:00Z"
      },
      {...}
    ],
    "totalPoints": 150,
    "timeRange": {
      "start": "2025-10-22T08:15:00Z",
      "end": "2025-10-22T14:25:00Z"
    }
  }
}
```

---

### 5. Get Active Tracking

Get latest positions for all active flights.

**Endpoint:** `GET /api/tracking/active`

**Query Parameters:**
- `limit` - Maximum number of results (default: 100)

**Response:** `200 OK`

---

### 6. Complete Flight

Mark flight as completed and move tracking data to logs.

**Endpoint:** `POST /api/tracking/:flightNumber/complete`

**Description:**
This endpoint:
1. Retrieves all tracking data for the flight
2. Creates a log entry with complete tracking history
3. Calculates flight statistics
4. Marks all tracking data as inactive
5. Updates flight status to "landed"

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Flight completed and moved to logs",
  "data": {
    "flightLog": {...},
    "trackingPointsArchived": 150
  }
}
```

---

## Log Endpoints

### 1. Get All Flight Logs

Retrieve all completed flight logs with pagination.

**Endpoint:** `GET /api/logs`

**Query Parameters:**
- `airline` - Filter by airline
- `origin` - Filter by origin airport
- `destination` - Filter by destination airport
- `limit` - Results per page (default: 50)
- `page` - Page number (default: 1)

**Response:** `200 OK`
```json
{
  "success": true,
  "count": 50,
  "total": 500,
  "page": 1,
  "totalPages": 10,
  "data": [...]
}
```

---

### 2. Get Flight Log by Number

Get most recent log for a specific flight number.

**Endpoint:** `GET /api/logs/:flightNumber`

**Response:** `200 OK`

---

### 3. Get All Logs for Flight

Get all historical logs for a flight number.

**Endpoint:** `GET /api/logs/:flightNumber/all`

**Response:** `200 OK`

---

### 4. Get Flight Statistics

Get aggregated statistics for a flight.

**Endpoint:** `GET /api/logs/:flightNumber/statistics`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "flightNumber": "AA123",
    "aggregateStatistics": {
      "totalFlights": 25,
      "averageDistance": 2475.5,
      "averageSpeed": 425.3,
      "averageDuration": 352.8,
      "maxSpeed": 485.2,
      "maxAltitude": 38000
    },
    "recentFlights": [...]
  }
}
```

---

### 5. Delete Flight Log

Delete a specific flight log.

**Endpoint:** `DELETE /api/logs/:id`

**Response:** `200 OK`

---

## Status Codes

- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

---

## Data Flow

1. **Create Flight** → Flight is created with status "scheduled"
2. **Ingest Tracking Data** → Flight status auto-updates to "in-flight"
3. **Track Flight** → Real-time tracking data accumulates
4. **Complete Flight** → Tracking data moved to logs with statistics

---

## Example Workflow

```bash
# 1. Create a flight
POST /api/flights
{...flight data...}

# 2. Ingest tracking data (multiple times during flight)
POST /api/tracking/ingest
{...tracking data...}

# 3. Track the flight
GET /api/tracking/AA123/location
GET /api/tracking/AA123/path

# 4. Complete the flight
POST /api/tracking/AA123/complete

# 5. View flight log and statistics
GET /api/logs/AA123
GET /api/logs/AA123/statistics
```

---

## Notes

- All timestamps should be in ISO 8601 format
- Flight numbers are automatically converted to uppercase
- Coordinates use WGS84 datum (standard GPS)
- Altitude is in feet
- Speed is in knots
- Heading is in degrees (0-360)

