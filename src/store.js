// store.js
import { create } from 'zustand';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

// Auth Store
export const useAuthStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  username: localStorage.getItem('username') || null,
  isAuthenticated: !!localStorage.getItem('token'),

  login: async (email, password) => {
    try {
      const response = await axios.post(`${API_URL}/login`, { email, password });
      const { token, username } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      
      set({ token, username, isAuthenticated: true });
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Login failed' 
      };
    }
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    set({ token: null, username: null, isAuthenticated: false });
  }
}));

// Movie Store
export const useMovieStore = create((set, get) => ({
  movies: [],
  totalMovies: 0,
  currentPage: 1,
  loading: false,
  error: null,

  // Fetch movies with search, sort, and pagination
  fetchMovies: async (page = 1, search = '', sort = 'title', limit = 5) => {
    try {
      set({ loading: true, error: null });
      
      // Build query string with all parameters
      const queryParams = new URLSearchParams({
        page,
        limit,
        ...(search && { search }),
        sort
      }).toString();
      
      console.log(`Fetching movies with query: ${queryParams}`);
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/movies?${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('Movies response:', response.data);
      
      set({ 
        movies: response.data.movies, 
        totalMovies: response.data.totalMovies,
        currentPage: response.data.currentPage,
        loading: false 
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching movies:', error);
      set({ 
        error: error.response?.data?.message || 'Failed to fetch movies', 
        loading: false 
      });
      return { movies: [], totalMovies: 0 };
    }
  },

  // Add a new movie
  addMovie: async (movieData) => {
    try {
      set({ loading: true, error: null });
      
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/movies`, movieData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Fetch movies to update the list after adding
      await get().fetchMovies(get().currentPage);
      
      set({ loading: false });
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to add movie', 
        loading: false 
      });
      throw error;
    }
  },

  // Update a movie
  updateMovie: async (id, movieData) => {
    try {
      set({ loading: true, error: null });
      
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/movies/${id}`, movieData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Update the movie in the local state
      set(state => ({
        movies: state.movies.map(movie => 
          movie.id === id ? { ...movie, ...movieData } : movie
        ),
        loading: false
      }));
      
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to update movie', 
        loading: false 
      });
      throw error;
    }
  },

  // Delete a movie
  deleteMovie: async (id) => {
    try {
      set({ loading: true, error: null });
      
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_URL}/movies/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // Remove the movie from local state
      set(state => {
        const newMovies = state.movies.filter(movie => movie.id !== id);
        
        // If we've deleted the last movie on a page, go to previous page
        let newPage = state.currentPage;
        if (newMovies.length === 0 && state.currentPage > 1) {
          newPage = state.currentPage - 1;
          // We'll need to fetch movies for the new page
          get().fetchMovies(newPage);
        }
        
        return {
          movies: newMovies,
          totalMovies: state.totalMovies - 1,
          currentPage: newPage,
          loading: false
        };
      });
      
      return response.data;
    } catch (error) {
      set({ 
        error: error.response?.data?.message || 'Failed to delete movie', 
        loading: false 
      });
      throw error;
    }
  }
}));