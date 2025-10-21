import express from 'express';
import {
    ingestTrackingData,
    ingestBatchTrackingData,
    getFlightLocation,
    getFlightPath,
    getAllActiveTracking,
    completeFlight
} from '../controllers/trackingController.js';

const router = express.Router();

/**
 * @route   POST /api/tracking/ingest
 * @desc    Ingest tracking data from radio signal receiver
 * @access  Public
 * @body    flightNumber, position, speed, heading, verticalSpeed, receiverInfo, timestamp, squawk
 */
router.post('/ingest', ingestTrackingData);

/**
 * @route   POST /api/tracking/ingest/batch
 * @desc    Ingest multiple tracking data points at once
 * @access  Public
 * @body    flightNumber, trackingDataArray[]
 */
router.post('/ingest/batch', ingestBatchTrackingData);

/**
 * @route   GET /api/tracking/active
 * @desc    Get all active tracking data (latest position for each active flight)
 * @access  Public
 */
router.get('/active', getAllActiveTracking);

/**
 * @route   GET /api/tracking/:flightNumber/location
 * @desc    Get flight location at a given time
 * @access  Public
 * @query   timestamp (optional, defaults to current time)
 */
router.get('/:flightNumber/location', getFlightLocation);

/**
 * @route   GET /api/tracking/:flightNumber/path
 * @desc    Get complete flight path
 * @access  Public
 * @query   startTime (optional), endTime (optional)
 */
router.get('/:flightNumber/path', getFlightPath);

/**
 * @route   POST /api/tracking/:flightNumber/complete
 * @desc    Mark flight as completed and move tracking data to logs
 * @access  Public
 */
router.post('/:flightNumber/complete', completeFlight);

export default router;

