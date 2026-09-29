import express from 'express';
import v0 from './v0.route';

const router = express.Router();

// Only add API Version paths are this level
router.use('/v0', v0);

export default router;
