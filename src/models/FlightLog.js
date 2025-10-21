import mongoose from 'mongoose';

// Schema for completed flight logs (archived tracking data)
const flightLogSchema = new mongoose.Schema({
    flightNumber: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    flightInfo: {
        airline: String,
        aircraftType: String,
        origin: {
            airport: String,
            city: String,
            country: String,
            coordinates: {
                latitude: Number,
                longitude: Number
            }
        },
        destination: {
            airport: String,
            city: String,
            country: String,
            coordinates: {
                latitude: Number,
                longitude: Number
            }
        },
        scheduledDeparture: Date,
        scheduledArrival: Date,
        actualDeparture: Date,
        actualArrival: Date
    },
    // Complete tracking history for this flight
    trackingData: [{
        position: {
            latitude: Number,
            longitude: Number,
            altitude: Number
        },
        speed: Number,
        heading: Number,
        verticalSpeed: Number,
        receiverInfo: {
            receiverId: String,
            receiverLocation: {
                latitude: Number,
                longitude: Number
            },
            signalStrength: Number
        },
        timestamp: Date,
        squawk: String
    }],
    // Flight statistics
    statistics: {
        totalDistance: {
            type: Number,
            // Total distance traveled in nautical miles
        },
        averageSpeed: {
            type: Number,
            // Average speed in knots
        },
        maxSpeed: {
            type: Number,
            // Maximum speed in knots
        },
        maxAltitude: {
            type: Number,
            // Maximum altitude in feet
        },
        flightDuration: {
            type: Number,
            // Duration in minutes
        },
        numberOfTrackingPoints: {
            type: Number
        }
    },
    completedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
flightLogSchema.index({ flightNumber: 1, completedAt: -1 });
flightLogSchema.index({ 'flightInfo.origin.airport': 1 });
flightLogSchema.index({ 'flightInfo.destination.airport': 1 });
flightLogSchema.index({ completedAt: -1 });

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3440.065; // Earth's radius in nautical miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// Method to calculate flight statistics
flightLogSchema.methods.calculateStatistics = function() {
    if (!this.trackingData || this.trackingData.length === 0) {
        return;
    }
    
    let totalDistance = 0;
    let totalSpeed = 0;
    let maxSpeed = 0;
    let maxAltitude = 0;
    
    for (let i = 0; i < this.trackingData.length; i++) {
        const point = this.trackingData[i];
        
        // Calculate distance traveled
        if (i > 0) {
            const prevPoint = this.trackingData[i - 1];
            totalDistance += calculateDistance(
                prevPoint.position.latitude,
                prevPoint.position.longitude,
                point.position.latitude,
                point.position.longitude
            );
        }
        
        // Track speeds and altitude
        totalSpeed += point.speed;
        maxSpeed = Math.max(maxSpeed, point.speed);
        maxAltitude = Math.max(maxAltitude, point.position.altitude);
    }
    
    const startTime = new Date(this.trackingData[0].timestamp);
    const endTime = new Date(this.trackingData[this.trackingData.length - 1].timestamp);
    const durationMinutes = (endTime - startTime) / (1000 * 60);
    
    this.statistics = {
        totalDistance: Math.round(totalDistance * 100) / 100,
        averageSpeed: Math.round((totalSpeed / this.trackingData.length) * 100) / 100,
        maxSpeed: Math.round(maxSpeed * 100) / 100,
        maxAltitude: Math.round(maxAltitude),
        flightDuration: Math.round(durationMinutes * 100) / 100,
        numberOfTrackingPoints: this.trackingData.length
    };
};

const FlightLog = mongoose.model('FlightLog', flightLogSchema);

export default FlightLog;

