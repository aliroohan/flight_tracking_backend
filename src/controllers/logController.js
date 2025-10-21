import FlightLog from '../models/FlightLog.js';

/**
 * GET API to retrieve all flight logs
 */
export const getAllFlightLogs = async (req, res) => {
    try {
        const { airline, origin, destination, limit = 50, page = 1 } = req.query;
        
        let query = {};
        if (airline) query['flightInfo.airline'] = { $regex: airline, $options: 'i' };
        if (origin) query['flightInfo.origin.airport'] = origin.toUpperCase();
        if (destination) query['flightInfo.destination.airport'] = destination.toUpperCase();
        
        const logs = await FlightLog.find(query)
            .sort({ completedAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));
        
        const total = await FlightLog.countDocuments(query);
        
        res.status(200).json({ 
            success: true,
            count: logs.length,
            total: total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            data: logs 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching flight logs',
            error: error.message 
        });
    }
};

/**
 * GET API to retrieve a specific flight log
 */
export const getFlightLogByNumber = async (req, res) => {
    try {
        const { flightNumber } = req.params;
        
        // Get the most recent log for this flight number
        const log = await FlightLog.findOne({ flightNumber: flightNumber.toUpperCase() })
            .sort({ completedAt: -1 });
        
        if (!log) {
            return res.status(404).json({ 
                success: false,
                message: 'Flight log not found' 
            });
        }
        
        res.status(200).json({ 
            success: true,
            data: log 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching flight log',
            error: error.message 
        });
    }
};

/**
 * GET API to retrieve all logs for a specific flight number
 */
export const getAllLogsForFlight = async (req, res) => {
    try {
        const { flightNumber } = req.params;
        
        const logs = await FlightLog.find({ flightNumber: flightNumber.toUpperCase() })
            .sort({ completedAt: -1 });
        
        if (logs.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'No flight logs found for this flight number' 
            });
        }
        
        res.status(200).json({ 
            success: true,
            count: logs.length,
            data: logs 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching flight logs',
            error: error.message 
        });
    }
};

/**
 * GET API to retrieve flight statistics
 */
export const getFlightStatistics = async (req, res) => {
    try {
        const { flightNumber } = req.params;
        
        const logs = await FlightLog.find({ flightNumber: flightNumber.toUpperCase() })
            .sort({ completedAt: -1 });
        
        if (logs.length === 0) {
            return res.status(404).json({ 
                success: false,
                message: 'No flight logs found for this flight number' 
            });
        }
        
        // Aggregate statistics across all flights
        const aggregateStats = {
            totalFlights: logs.length,
            averageDistance: 0,
            averageSpeed: 0,
            averageDuration: 0,
            maxSpeed: 0,
            maxAltitude: 0
        };
        
        logs.forEach(log => {
            if (log.statistics) {
                aggregateStats.averageDistance += log.statistics.totalDistance || 0;
                aggregateStats.averageSpeed += log.statistics.averageSpeed || 0;
                aggregateStats.averageDuration += log.statistics.flightDuration || 0;
                aggregateStats.maxSpeed = Math.max(aggregateStats.maxSpeed, log.statistics.maxSpeed || 0);
                aggregateStats.maxAltitude = Math.max(aggregateStats.maxAltitude, log.statistics.maxAltitude || 0);
            }
        });
        
        aggregateStats.averageDistance /= logs.length;
        aggregateStats.averageSpeed /= logs.length;
        aggregateStats.averageDuration /= logs.length;
        
        res.status(200).json({ 
            success: true,
            data: {
                flightNumber: flightNumber.toUpperCase(),
                aggregateStatistics: aggregateStats,
                recentFlights: logs.slice(0, 5).map(log => ({
                    completedAt: log.completedAt,
                    statistics: log.statistics
                }))
            }
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching flight statistics',
            error: error.message 
        });
    }
};

/**
 * DELETE API to delete a flight log
 */
export const deleteFlightLog = async (req, res) => {
    try {
        const { id } = req.params;
        
        const log = await FlightLog.findByIdAndDelete(id);
        
        if (!log) {
            return res.status(404).json({ 
                success: false,
                message: 'Flight log not found' 
            });
        }
        
        res.status(200).json({ 
            success: true,
            message: 'Flight log deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error deleting flight log',
            error: error.message 
        });
    }
};

