import mongoose from 'mongoose';

const flightSchema = new mongoose.Schema({
    flightNumber: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        // Format: AA123 (airline code + number)
    },
    airline: {
        type: String,
        required: true,
        trim: true
    },
    aircraftType: {
        type: String,
        required: true,
        trim: true
    },
    origin: {
        airport: {
            type: String,
            required: true,
            uppercase: true,
            trim: true
        },
        city: {
            type: String,
            required: true,
            trim: true
        },
        country: {
            type: String,
            required: true,
            trim: true
        },
        coordinates: {
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
            }
        }
    },
    destination: {
        airport: {
            type: String,
            required: true,
            uppercase: true,
            trim: true
        },
        city: {
            type: String,
            required: true,
            trim: true
        },
        country: {
            type: String,
            required: true,
            trim: true
        },
        coordinates: {
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
            }
        }
    },
    scheduledDeparture: {
        type: Date,
        required: true
    },
    scheduledArrival: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'boarding', 'departed', 'in-flight', 'landed', 'cancelled'],
        default: 'scheduled'
    },
    actualDeparture: {
        type: Date
    },
    actualArrival: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for faster queries
flightSchema.index({ flightNumber: 1 });
flightSchema.index({ status: 1 });
flightSchema.index({ scheduledDeparture: 1 });

const Flight = mongoose.model('Flight', flightSchema);

export default Flight;

