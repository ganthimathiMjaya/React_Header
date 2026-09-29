import express from 'express';
import LocationController from '../controllers/location/location.controller';

const location = express.Router();
const controller = new LocationController();

location.get('/', async (_req, res) => {
  const locations = await controller.getRecentLocations(_req, res);

  res.json(locations);
});

export default location;
