import Movie from '../models/movie.model.js';
import { Op } from 'sequelize';

export const getMovies = async (req, res) => {
  try {
    const { page = 1, limit = 5, search = '', sort = 'title' } = req.query;
    const offset = (page - 1) * limit;
    const whereClause = { user_id: req.user.id };

    if (search.trim() !== '') {
      whereClause.title = { [Op.like]: `%${search}%` };
    }

    const validSortFields = ['title', 'release_year', 'rating', 'createdAt', 'status'];
    const sortField = validSortFields.includes(sort) ? sort : 'title';

    const { count, rows } = await Movie.findAndCountAll({
      where: whereClause,
      order: [[sortField, 'ASC']],
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });

    res.json({ movies: rows, totalMovies: count, currentPage: parseInt(page, 10) });
  } catch (err) {
    res.status(500).json({ message: err.message || 'Error fetching movies.' });
  }
};
