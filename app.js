import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import mongoose from "mongoose";

// Import routes
import flightRoutes from './src/routes/flightRoutes.js';
import trackingRoutes from './src/routes/trackingRoutes.js';
import logRoutes from './src/routes/logRoutes.js';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.log("MongoDB connection error:", err);
    process.exit(1);
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// Basic route
app.get("/", (req, res) => {
    res.json({
        message: "FlightAware API - Flight Tracking System",
        version: "1.0.0",
        endpoints: {
            flights: "/api/flights",
            tracking: "/api/tracking",
            logs: "/api/logs"
        }
    });
});

// API Routes
app.use('/api/flights', flightRoutes);
app.use('/api/tracking', trackingRoutes);
app.use('/api/logs', logRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
