import express from 'express';
import {
    getAllFlightLogs,
    getFlightLogByNumber,
    getAllLogsForFlight,
    getFlightStatistics,
    deleteFlightLog
} from '../controllers/logController.js';

const router = express.Router();

/**
 * @route   GET /api/logs
 * @desc    Get all flight logs with pagination
 * @access  Public
 * @query   airline, origin, destination, limit, page
 */
router.get('/', getAllFlightLogs);

/**
 * @route   GET /api/logs/:flightNumber
 * @desc    Get most recent flight log for a specific flight number
 * @access  Public
 */
router.get('/:flightNumber', getFlightLogByNumber);

/**
 * @route   GET /api/logs/:flightNumber/all
 * @desc    Get all logs for a specific flight number
 * @access  Public
 */
router.get('/:flightNumber/all', getAllLogsForFlight);

/**
 * @route   GET /api/logs/:flightNumber/statistics
 * @desc    Get flight statistics
 * @access  Public
 */
router.get('/:flightNumber/statistics', getFlightStatistics);

/**
 * @route   DELETE /api/logs/:id
 * @desc    Delete a flight log
 * @access  Public
 */
router.delete('/:id', deleteFlightLog);

export default router;

