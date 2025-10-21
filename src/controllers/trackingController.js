import FlightTracking from '../models/FlightTracking.js';
import Flight from '../models/Flight.js';
import FlightLog from '../models/FlightLog.js';

/**
 * POST API to ingest tracking data from radio signal receivers
 * This mimics the data received from actual radio receivers
 */
export const ingestTrackingData = async (req, res) => {
    try {
        const trackingData = req.body;
        
        // Validate that flight exists
        const flight = await Flight.findOne({ flightNumber: trackingData.flightNumber.toUpperCase() });
        
        if (!flight) {
            return res.status(404).json({ 
                success: false,
                message: 'Flight not found. Please create the flight first.' 
            });
        }
        
        // Create new tracking entry
        const tracking = new FlightTracking({
            flightNumber: trackingData.flightNumber.toUpperCase(),
            position: trackingData.position,
            speed: trackingData.speed,
            heading: trackingData.heading,
            verticalSpeed: trackingData.verticalSpeed,
            receiverInfo: trackingData.receiverInfo,
            timestamp: trackingData.timestamp || new Date(),
            squawk: trackingData.squawk,
            isActive: true
        });
        
        await tracking.save();
        
        // Update flight status if needed
        if (flight.status === 'scheduled' || flight.status === 'boarding') {
            flight.status = 'in-flight';
            if (!flight.actualDeparture) {
                flight.actualDeparture = tracking.timestamp;
            }
            await flight.save();
        }
        
        res.status(201).json({ 
            success: true,
            message: 'Tracking data ingested successfully',
            data: tracking 
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            message: 'Error ingesting tracking data',
            error: error.message 
        });
    }
};

/**
 * POST API to ingest multiple tracking data points at once (batch ingestion)
 */
export const ingestBatchTrackingData = async (req, res) => {
    try {
        const { flightNumber, trackingDataArray } = req.body;
        
        if (!Array.isArray(trackingDataArray) || trackingDataArray.length === 0) {
            return res.status(400).json({ 
                success: false,
                message: 'trackingDataArray must be a non-empty array' 
            });
        }
        
        // Validate that flight exists
        const flight = await Flight.findOne({ flightNumber: flightNumber.toUpperCase() });
        
        if (!flight) {
            return res.status(404).json({ 
                success: false,
                message: 'Flight not found. Please create the flight first.' 
            });
        }
        
        // Prepare tracking data for batch insert
        const trackingDocuments = trackingDataArray.map(data => ({
            flightNumber: flightNumber.toUpperCase(),
            position: data.position,
            speed: data.speed,
            heading: data.heading,
            verticalSpeed: data.verticalSpeed,
            receiverInfo: data.receiverInfo,
            timestamp: data.timestamp || new Date(),
            squawk: data.squawk,
            isActive: true
        }));
        
        // Batch insert
        const result = await FlightTracking.insertMany(trackingDocuments);
        
        // Update flight status
        if (flight.status === 'scheduled' || flight.status === 'boarding') {
            flight.status = 'in-flight';
            if (!flight.actualDeparture) {
                flight.actualDeparture = result[0].timestamp;
            }
            await flight.save();
        }
        
        res.status(201).json({ 
            success: true,
            message: `${result.length} tracking data points ingested successfully`,
            count: result.length,
            data: result 
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            message: 'Error ingesting batch tracking data',
            error: error.message 
        });
    }
};

/**
 * GET API to retrieve flight location at a specific time
 * Query params: flightNumber (required), timestamp (optional - defaults to current time)
 */
export const getFlightLocation = async (req, res) => {
    try {
        const { flightNumber } = req.params;
        const { timestamp } = req.query;
        
        let trackingData;
        
        if (timestamp) {
            // Get location at specific time
            trackingData = await FlightTracking.getPositionAtTime(
                flightNumber.toUpperCase(), 
                timestamp
            );
        } else {
            // Get latest location
            trackingData = await FlightTracking.getLatestPosition(
                flightNumber.toUpperCase()
            );
        }
        
        if (!trackingData) {
            return res.status(404).json({ 
                success: false,
                message: 'No tracking data found for this flight' + (timestamp ? ' at the specified time' : '')
            });
        }
        
        // Get flight info
        const flight = await Flight.findOne({ flightNumber: flightNumber.toUpperCase() });
        
        res.status(200).json({ 
            success: true,
            data: {
                flightInfo: {
                    flightNumber: flight.flightNumber,
                    airline: flight.airline,
                    aircraftType: flight.aircraftType,
                    origin: flight.origin,
                    destination: flight.destination,
                    status: flight.status
                },
                currentPosition: {
                    latitude: trackingData.position.latitude,
                    longitude: trackingData.position.longitude,
                    altitude: trackingData.position.altitude,
                    speed: trackingData.speed,
                    heading: trackingData.heading,
                    verticalSpeed: trackingData.verticalSpeed,
                    timestamp: trackingData.timestamp
                },
                receiverInfo: trackingData.receiverInfo
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching flight location',
            error: error.message 
        });
    }
};

/**
 * GET API to retrieve complete flight path
 * Query params: startTime (optional), endTime (optional)
 */
export const getFlightPath = async (req, res) => {
    try {
        const { flightNumber } = req.params;
        const { startTime, endTime } = req.query;
        
        const trackingData = await FlightTracking.getFlightPath(
            flightNumber.toUpperCase(),
            startTime,
            endTime
        );
        
        if (trackingData.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'No tracking data found for this flight' 
            });
        }
        
        // Get flight info
        const flight = await Flight.findOne({ flightNumber: flightNumber.toUpperCase() });
        
        // Format path data for map visualization
        const pathCoordinates = trackingData.map(point => ({
            latitude: point.position.latitude,
            longitude: point.position.longitude,
            altitude: point.position.altitude,
            speed: point.speed,
            heading: point.heading,
            timestamp: point.timestamp
        }));
        
        res.status(200).json({ 
            success: true,
            data: {
                flightInfo: {
                    flightNumber: flight.flightNumber,
                    airline: flight.airline,
                    origin: flight.origin,
                    destination: flight.destination,
                    status: flight.status
                },
                path: pathCoordinates,
                totalPoints: trackingData.length,
                timeRange: {
                    start: trackingData[0].timestamp,
                    end: trackingData[trackingData.length - 1].timestamp
                }
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching flight path',
            error: error.message 
        });
    }
};

/**
 * GET API to retrieve all active tracking data
 */
export const getAllActiveTracking = async (req, res) => {
    try {
        const { limit = 100 } = req.query;
        
        const trackingData = await FlightTracking.find({ isActive: true })
            .sort({ timestamp: -1 })
            .limit(parseInt(limit));
        
        // Group by flight number to get latest position for each flight
        const latestPositions = {};
        
        trackingData.forEach(data => {
            if (!latestPositions[data.flightNumber] || 
                data.timestamp > latestPositions[data.flightNumber].timestamp) {
                latestPositions[data.flightNumber] = data;
            }
        });
        
        res.status(200).json({ 
            success: true,
            count: Object.keys(latestPositions).length,
            data: Object.values(latestPositions)
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching active tracking data',
            error: error.message 
        });
    }
};

/**
 * POST API to mark flight as completed and move to logs
 */
export const completeFlight = async (req, res) => {
    try {
        const { flightNumber } = req.params;
        
        // Get flight info
        const flight = await Flight.findOne({ flightNumber: flightNumber.toUpperCase() });
        
        if (!flight) {
            return res.status(404).json({ 
                success: false,
                message: 'Flight not found' 
            });
        }
        
        // Get all tracking data for this flight
        const trackingData = await FlightTracking.find({ 
            flightNumber: flightNumber.toUpperCase(),
            isActive: true 
        }).sort({ timestamp: 1 });
        
        if (trackingData.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'No tracking data found for this flight' 
            });
        }
        
        // Create flight log
        const flightLog = new FlightLog({
            flightNumber: flight.flightNumber,
            flightInfo: {
                airline: flight.airline,
                aircraftType: flight.aircraftType,
                origin: flight.origin,
                destination: flight.destination,
                scheduledDeparture: flight.scheduledDeparture,
                scheduledArrival: flight.scheduledArrival,
                actualDeparture: flight.actualDeparture,
                actualArrival: flight.actualArrival || new Date()
            },
            trackingData: trackingData.map(t => ({
                position: t.position,
                speed: t.speed,
                heading: t.heading,
                verticalSpeed: t.verticalSpeed,
                receiverInfo: t.receiverInfo,
                timestamp: t.timestamp,
                squawk: t.squawk
            }))
        });
        
        // Calculate statistics
        flightLog.calculateStatistics();
        
        // Save log
        await flightLog.save();
        
        // Mark all tracking data as inactive (archive)
        await FlightTracking.updateMany(
            { flightNumber: flightNumber.toUpperCase() },
            { isActive: false }
        );
        
        // Update flight status
        flight.status = 'landed';
        if (!flight.actualArrival) {
            flight.actualArrival = new Date();
        }
        await flight.save();
        
        res.status(200).json({ 
            success: true,
            message: 'Flight completed and moved to logs',
            data: {
                flightLog: flightLog,
                trackingPointsArchived: trackingData.length
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error completing flight',
            error: error.message 
        });
    }
};

