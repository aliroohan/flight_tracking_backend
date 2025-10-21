import mongoose from 'mongoose';

// Schema for real-time flight tracking data (active flights)
const flightTrackingSchema = new mongoose.Schema({
    flightNumber: {
        type: String,
        required: true,
        uppercase: true,
        trim: true,
        ref: 'Flight'
    },
    // Position data from radio signal receiver
    position: {
        latitude: {
            type: Number,
            required: true,
            min: -90,
            max: 90
        },
        longitude: {
            type: Number,
            required: true,
            min: -180,
            max: 180
        },
        altitude: {
            type: Number,
            required: true,
            // Altitude in feet
        }
    },
    // Flight parameters
    speed: {
        type: Number,
        required: true,
        // Speed in knots
    },
    heading: {
        type: Number,
        required: true,
        min: 0,
        max: 360,
        // Direction in degrees (0-360, where 0/360 is North)
    },
    verticalSpeed: {
        type: Number,
        required: true,
        // Rate of climb/descent in feet per minute
    },
    // Signal metadata
    receiverInfo: {
        receiverId: {
            type: String,
            required: true
        },
        receiverLocation: {
            latitude: Number,
            longitude: Number
        },
        signalStrength: {
            type: Number,
            min: 0,
            max: 100
        }
    },
    timestamp: {
        type: Date,
        required: true,
        default: Date.now
    },
    squawk: {
        type: String,
        // Transponder code (4 digits)
    },
    // Additional metadata
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Compound indexes for efficient queries
flightTrackingSchema.index({ flightNumber: 1, timestamp: -1 });
flightTrackingSchema.index({ flightNumber: 1, isActive: 1 });
flightTrackingSchema.index({ timestamp: 1 });

// Method to get latest position for a flight
flightTrackingSchema.statics.getLatestPosition = async function(flightNumber) {
    return await this.findOne({ flightNumber, isActive: true })
        .sort({ timestamp: -1 })
        .limit(1);
};

// Method to get position at specific time
flightTrackingSchema.statics.getPositionAtTime = async function(flightNumber, timestamp) {
    // Find the closest tracking point at or before the given time
    return await this.findOne({ 
        flightNumber, 
        timestamp: { $lte: new Date(timestamp) }
    })
    .sort({ timestamp: -1 })
    .limit(1);
};

// Method to get flight path
flightTrackingSchema.statics.getFlightPath = async function(flightNumber, startTime, endTime) {
    const query = { flightNumber };
    
    if (startTime || endTime) {
        query.timestamp = {};
        if (startTime) query.timestamp.$gte = new Date(startTime);
        if (endTime) query.timestamp.$lte = new Date(endTime);
    }
    
    return await this.find(query).sort({ timestamp: 1 });
};

const FlightTracking = mongoose.model('FlightTracking', flightTrackingSchema);

export default FlightTracking;

