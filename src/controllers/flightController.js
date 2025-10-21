import Flight from '../models/Flight.js';

// Create a new flight
export const createFlight = async (req, res) => {
    try {
        const flightData = req.body;
        
        // Check if flight already exists
        const existingFlight = await Flight.findOne({ flightNumber: flightData.flightNumber });
        if (existingFlight) {
            return res.status(400).json({ 
                success: false,
                message: 'Flight with this flight number already exists' 
            });
        }
        
        const flight = new Flight(flightData);
        await flight.save();
        
        res.status(201).json({ 
            success: true,
            message: 'Flight created successfully',
            data: flight 
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            message: 'Error creating flight',
            error: error.message 
        });
    }
};

// Get all flights
export const getAllFlights = async (req, res) => {
    try {
        const { status, airline, origin, destination } = req.query;
        
        let query = {};
        if (status) query.status = status;
        if (airline) query.airline = { $regex: airline, $options: 'i' };
        if (origin) query['origin.airport'] = origin.toUpperCase();
        if (destination) query['destination.airport'] = destination.toUpperCase();
        
        const flights = await Flight.find(query).sort({ scheduledDeparture: -1 });
        
        res.status(200).json({ 
            success: true,
            count: flights.length,
            data: flights 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching flights',
            error: error.message 
        });
    }
};

// Get flight by flight number
export const getFlightByNumber = async (req, res) => {
    try {
        const { flightNumber } = req.params;
        
        const flight = await Flight.findOne({ flightNumber: flightNumber });
        
        if (!flight) {
            return res.status(404).json({ 
                success: false,
                message: 'Flight not found' 
            });
        }
        
        res.status(200).json({ 
            success: true,
            data: flight 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching flight',
            error: error.message 
        });
    }
};

// Update flight status
export const updateFlightStatus = async (req, res) => {
    try {
        const { flightNumber } = req.params;
        const { status, actualDeparture, actualArrival } = req.body;
        
        const updateData = { status };
        if (actualDeparture) updateData.actualDeparture = actualDeparture;
        if (actualArrival) updateData.actualArrival = actualArrival;
        
        const flight = await Flight.findOneAndUpdate(
            { flightNumber: flightNumber.toUpperCase() },
            updateData,
            { new: true }
        );
        
        if (!flight) {
            return res.status(404).json({ 
                success: false,
                message: 'Flight not found' 
            });
        }
        
        res.status(200).json({ 
            success: true,
            message: 'Flight status updated successfully',
            data: flight 
        });
    } catch (error) {
        res.status(400).json({ 
            success: false,
            message: 'Error updating flight status',
            error: error.message 
        });
    }
};

// Delete flight
export const deleteFlight = async (req, res) => {
    try {
        const { flightNumber } = req.params;
        
        const flight = await Flight.findOneAndDelete({ flightNumber: flightNumber.toUpperCase() });
        
        if (!flight) {
            return res.status(404).json({ 
                success: false,
                message: 'Flight not found' 
            });
        }
        
        res.status(200).json({ 
            success: true,
            message: 'Flight deleted successfully' 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error deleting flight',
            error: error.message 
        });
    }
};

// Get active flights (in-flight)
export const getActiveFlights = async (req, res) => {
    try {
        const flights = await Flight.find({ 
            status: { $in: ['boarding', 'departed', 'in-flight'] }
        }).sort({ scheduledDeparture: -1 });
        
        res.status(200).json({ 
            success: true,
            count: flights.length,
            data: flights 
        });
    } catch (error) {
        res.status(500).json({ 
            success: false,
            message: 'Error fetching active flights',
            error: error.message 
        });
    }
};

