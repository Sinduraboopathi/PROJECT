import sequelize from '../config/database.js';
import User from './user.model.js';
import Movie from './movie.model.js';
import ResetToken from './resetToken.model.js';

const db = { sequelize, User, Movie, ResetToken };

export default db;
