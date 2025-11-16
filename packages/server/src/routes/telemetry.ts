import { Router } from 'express';
import type { TelemetryService } from '../TelemetryService';

export function createTelemetryRoutes(telemetryService: TelemetryService): Router {
  const router = Router();

  /**
   * GET /telemetry/latest
   * Get latest telemetry data
   */
  router.get('/latest', (req, res) => {
    const latest = telemetryService.getLatestTelemetry();
    if (!latest) {
      return res.status(404).json({ error: 'No telemetry data available' });
    }
    res.json(latest);
  });

  /**
   * GET /telemetry/history
   * Get telemetry history
   * Query params: limit (optional)
   */
  router.get('/history', (req, res) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const history = telemetryService.getTelemetryHistory(limit);
    res.json(history);
  });

  /**
   * GET /telemetry/range
   * Get telemetry for a time range
   * Query params: startTime, endTime (required)
   */
  router.get('/range', (req, res) => {
    const startTime = req.query.startTime
      ? parseInt(req.query.startTime as string, 10)
      : undefined;
    const endTime = req.query.endTime
      ? parseInt(req.query.endTime as string, 10)
      : undefined;

    if (startTime === undefined || endTime === undefined) {
      return res.status(400).json({ error: 'startTime and endTime are required' });
    }

    const range = telemetryService.getTelemetryRange(startTime, endTime);
    res.json(range);
  });

  /**
   * GET /telemetry/clients
   * Get connected clients
   */
  router.get('/clients', (req, res) => {
    const clients = telemetryService.getConnectedClients();
    res.json(clients);
  });

  /**
   * DELETE /telemetry/history
   * Clear telemetry history
   */
  router.delete('/history', (req, res) => {
    telemetryService.clearHistory();
    res.json({ message: 'Telemetry history cleared' });
  });

  return router;
}

