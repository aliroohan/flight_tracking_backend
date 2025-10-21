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

router.post('/ingest', ingestTrackingData);   // POST /api/tracking/ingest
router.post('/ingest/batch', ingestBatchTrackingData);   // POST /api/tracking/ingest/batch
router.get('/active', getAllActiveTracking);   // GET /api/tracking/active
router.get('/:flightNumber/location', getFlightLocation);   // GET /api/tracking/:flightNumber/location
router.get('/:flightNumber/path', getFlightPath);   // GET /api/tracking/:flightNumber/path
router.post('/:flightNumber/complete', completeFlight);   // POST /api/tracking/:flightNumber/complete

export default router;

