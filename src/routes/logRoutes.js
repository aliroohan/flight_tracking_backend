import express from 'express';
import {
    getAllFlightLogs,
    getFlightLogByNumber,
    getAllLogsForFlight,
    getFlightStatistics,
    deleteFlightLog
} from '../controllers/logController.js';

const router = express.Router();

router.get('/', getAllFlightLogs);   // GET /api/logs
router.get('/:flightNumber', getFlightLogByNumber);   // GET /api/logs/:flightNumber
router.get('/:flightNumber/all', getAllLogsForFlight);   // GET /api/logs/:flightNumber/all
router.get('/:flightNumber/statistics', getFlightStatistics);   // GET /api/logs/:flightNumber/statistics
router.delete('/:id', deleteFlightLog);   // DELETE /api/logs/:id

export default router;

