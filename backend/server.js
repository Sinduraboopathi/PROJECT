// import dotenv from 'dotenv';
// import express from 'express';
// import cors from 'cors';
// import { Sequelize, DataTypes, Op } from 'sequelize';
// import jwt from 'jsonwebtoken';
// import bcrypt from 'bcryptjs';
// import nodemailer from 'nodemailer';
// import crypto from 'crypto';
// import axios from 'axios';

// dotenv.config();

// const app = express();
// app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173', credentials: true }));
// app.use(express.json());


// const sequelize = new Sequelize('test_schema', 'root', process.env.DB_PASSWORD, {
//   host: process.env.DB_HOST || 'localhost',
//   dialect: 'mysql',
//   logging: false,
//   pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
// });

// const User = sequelize.define('User', {
//   username: { type: DataTypes.STRING, allowNull: false },
//   email: { type: DataTypes.STRING, allowNull: false, unique: true },
//   password: { type: DataTypes.STRING, allowNull: false },
// }, { timestamps: true, freezeTableName: true });

// sequelize.sync
// const Movie = sequelize.define('Movie', {
//   title: { type: DataTypes.STRING, allowNull: false },
//   genre: { type: DataTypes.STRING, allowNull: false },
//   release_year: { type: DataTypes.INTEGER, allowNull: false },
//   rating: { type: DataTypes.INTEGER, allowNull: false, validate: { min: 1, max: 5 } },
//   status: { type: DataTypes.ENUM('Watched', 'Watching', 'Plan to Watch'), allowNull: false },
//   user_id: { type: DataTypes.INTEGER, allowNull: false },
// }, { timestamps: true, freezeTableName: true, paranoid: true });

// const ResetToken = sequelize.define('ResetToken', {
//   token: { type: DataTypes.STRING, allowNull: false, unique: true },
//   email: { type: DataTypes.STRING, allowNull: false },
//   expires: { type: DataTypes.DATE, allowNull: false },
// }, { timestamps: false });


// sequelize.sync()
//   .then(() => console.log("✅ Database synchronized"))
//   .catch(err => console.error("❌ Database sync error:", err));

// const authenticateToken = (req, res, next) => {
//   const authHeader = req.header('Authorization');
//   if (!authHeader || !authHeader.startsWith('Bearer ')) 
//     return res.status(401).json({ message: "Access Denied: No token provided" });

//   const token = authHeader.split(' ')[1];
//   jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
//     if (err) return res.status(403).json({ message: "Invalid or Expired Token", error: err.message });
//     req.user = user;
//     next();
//   });
// };

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// app.post('/signup', async (req, res) => {
//   try {
//     const { username, email, password } = req.body;
//     if (!username || !email || !password) 
//       return res.status(400).json({ message: "All fields are required!" });

//     const existingUser = await User.findOne({ where: { email } });
//     if (existingUser) 
//       return res.status(400).json({ message: "Email already registered." });

//     const hashedPassword = await bcrypt.hash(password, 10);
//     await User.create({ username, email, password: hashedPassword });
//     res.status(201).json({ message: 'Signup successful!' });
//   } catch (err) {
//     console.error("Signup Error:", err);
//     res.status(500).json({ message: err.message || 'Error during signup.' });
//   }
// });

// app.post('/login', async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await User.findOne({ where: { email } });
//     if (!user || !(await bcrypt.compare(password, user.password))) 
//       return res.status(401).json({ message: 'Invalid credentials.' });

//     const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
//     res.status(200).json({ username: user.username, token });
//   } catch (err) {
//     console.error("Login Error:", err);
//     res.status(500).json({ message: err.message || 'Server error.' });
//   }
// });

// app.get('/profile', authenticateToken, (req, res) => {
//   res.json({ message: `Welcome ${req.user.username}, this is your profile!` });
// });

// app.post('/forgot-password', async (req, res) => {
//   try {
//     const { email } = req.body;
//     if (!email) 
//       return res.status(400).json({ message: "Email is required" });

//     const user = await User.findOne({ where: { email } });
//     if (!user) 
//       return res.status(400).json({ message: "User not found" });
   
//     const token = crypto.randomBytes(32).toString('hex');
//     const expires = new Date(Date.now() + 3600000); // 1 hour expiry
    
//     await ResetToken.destroy({ where: { email } });
    
//     await ResetToken.create({ token, email, expires });
   

//     const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${token}`;
    
//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: 'Password Reset',
//       text: `Click the link to reset your password: ${resetLink}`,
//       html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
//     });
   
//     res.json({ message: "Password reset link sent to your email" });
//   } catch (err) {
//     console.error("Forgot Password Error:", err);
//     res.status(500).json({ message: err.message || 'Server error.' });
//   }
// });

// app.post('/reset-password/:token', async (req, res) => {
//   try {
//     const { token } = req.params;
//     const { password } = req.body;
   
//     if (!password)
//       return res.status(400).json({ message: "Password is required" });
      
//     const resetToken = await ResetToken.findOne({ where: { token } });
//     if (!resetToken || resetToken.expires < new Date()) 
//       return res.status(400).json({ message: "Invalid or expired token" });
   
//     const hashedPassword = await bcrypt.hash(password, 10);
//     await User.update({ password: hashedPassword }, { where: { email: resetToken.email } });
//     await ResetToken.destroy({ where: { token } });
   
//     res.json({ message: "Password reset successful" });
//   } catch (err) {
//     console.error("Reset Password Error:", err);
//     res.status(500).json({ message: err.message || 'Server error.' });
//   }
// });


// app.get('/movies', authenticateToken, async (req, res) => {
//   try {
//     console.log('Movie request query:', req.query); 
    
//     const { page = 1, limit = 5, search = '', sort = 'title' } = req.query;
//     const offset = (page - 1) * limit;
    
//     const whereClause = {
//       user_id: req.user.id
//     };
    

//     if (search && search.trim() !== '') {
//       whereClause.title = { 
//         [Op.like]: `%${search}%` 
//       };
//     }
    
//     const validSortFields = ['title', 'release_year', 'rating', 'createdAt', 'status'];
//     const sortField = validSortFields.includes(sort) ? sort : 'title';
    
//     console.log('Executing query with:', {
//       whereClause,
//       sortField,
//       limit: parseInt(limit, 10),
//       offset: parseInt(offset, 10)
//     });
    
//     const { count, rows } = await Movie.findAndCountAll({
//       where: whereClause,
//       order: [[sortField, 'ASC']],
//       limit: parseInt(limit, 10),
//       offset: parseInt(offset, 10),
//     });
    
//     console.log(`Found ${count} movies`);
    
//     res.json({ 
//       movies: rows, 
//       totalMovies: count, 
//       currentPage: parseInt(page, 10) 
//     });
//   } catch (err) {
//     console.error("Fetch Movies Error:", err);
//     res.status(500).json({ message: err.message || 'Error fetching movies.' });
//   }
// });

// app.post('/movies', authenticateToken, async (req, res) => {
//   try {
//     const { title, genre, release_year, rating, status } = req.body;
    
//     if (!title || !genre || !release_year || !rating || !status) 
//       return res.status(400).json({ message: "All fields are required!" });

//     const movie = await Movie.create({ 
//       title, 
//       genre, 
//       release_year, 
//       rating, 
//       status, 
//       user_id: req.user.id 
//     });
    
//     res.status(201).json(movie);
//   } catch (err) {
//     console.error("Add Movie Error:", err);
//     res.status(400).json({ message: err.message || 'Error adding movie.' });
//   }
// });


// app.put('/movies/:id', authenticateToken, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const movie = await Movie.findOne({ where: { id, user_id: req.user.id } });
    
//     if (!movie) 
//       return res.status(404).json({ message: "Movie not found." });

//     await movie.update(req.body);
//     res.json({ message: "Movie updated successfully.", movie });
//   } catch (err) {
//     console.error("Update Movie Error:", err);
//     res.status(500).json({ message: err.message || 'Error updating movie.' });
//   }
// });

// app.delete('/movies/:id', authenticateToken, async (req, res) => {
//   try {
//     const { id } = req.params;
//     const deleted = await Movie.destroy({ where: { id, user_id: req.user.id } });
    
//     if (deleted === 0) 
//       return res.status(404).json({ message: "Movie not found or already deleted." });
      
//     res.json({ message: "Movie deleted successfully." });
//   } catch (err) {
//     console.error("Delete Movie Error:", err);
//     res.status(500).json({ message: err.message || 'Error deleting movie.' });
//   }
// });



// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));




import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import movieRoutes from './routes/movie.routes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/movies', movieRoutes);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    await sequelize.sync();
    console.log("✅ Database synchronized");

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  } catch (error) {
    console.error("❌ Database connection error:", error);
  }
};

startServer();
