import express from 'express';
import {
    createFlight,
    getAllFlights,
    getFlightByNumber,
    updateFlightStatus,
    deleteFlight,
    getActiveFlights
} from '../controllers/flightController.js';

const router = express.Router();

router.post('/', createFlight);   // POST /api/flights
router.get('/', getAllFlights);   // GET /api/flights
router.get('/active', getActiveFlights);   // GET /api/flights/active
router.get('/:flightNumber', getFlightByNumber);   // GET /api/flights/:flightNumber
router.put('/:flightNumber/status', updateFlightStatus);   // PUT /api/flights/:flightNumber/status

export default router;

