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

/**
 * @route   POST /api/flights
 * @desc    Create a new flight
 * @access  Public
 */
router.post('/', createFlight);

/**
 * @route   GET /api/flights
 * @desc    Get all flights (with optional filters)
 * @access  Public
 * @query   status, airline, origin, destination
 */
router.get('/', getAllFlights);

/**
 * @route   GET /api/flights/active
 * @desc    Get all active flights (currently in-flight)
 * @access  Public
 */
router.get('/active', getActiveFlights);

/**
 * @route   GET /api/flights/:flightNumber
 * @desc    Get flight by flight number
 * @access  Public
 */
router.get('/:flightNumber', getFlightByNumber);

/**
 * @route   PUT /api/flights/:flightNumber/status
 * @desc    Update flight status
 * @access  Public
 */
router.put('/:flightNumber/status', updateFlightStatus);

/**
 * @route   DELETE /api/flights/:flightNumber
 * @desc    Delete a flight
 * @access  Public
 */
router.delete('/:flightNumber', deleteFlight);

export default router;

