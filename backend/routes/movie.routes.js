import express from 'express';
import { getMovies } from '../controllers/movie.controller.js';
import authenticateToken from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authenticateToken, getMovies);

export default router;
