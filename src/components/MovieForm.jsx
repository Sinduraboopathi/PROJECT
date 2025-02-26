import React, { useState } from 'react';
import { useMovieStore } from '../store';

function MovieForm({ movie, onClose }) {
  const [formData, setFormData] = useState({
    title: movie?.title || '',
    genre: movie?.genre || '',
    release_year: movie?.release_year || new Date().getFullYear(),
    rating: movie?.rating || 5,
    status: movie?.status || 'Plan to Watch',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (movie?.id) {
        await useMovieStore.getState().updateMovie(movie.id, formData);
      } else {
        await useMovieStore.getState().addMovie(formData);
      }
      onClose();
    } catch (error) {
      console.error('Failed to save movie:', error);
    }
  };

  return (
    <div>
      <h2>{movie ? 'Edit Movie' : 'Add New Movie'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title:</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Genre:</label>
          <input
            type="text"
            value={formData.genre}
            onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
            required
          />
        </div>
        <div className="form-group">
          <label>Release Year:</label>
          <input
            type="number"
            value={formData.release_year}
            onChange={(e) => setFormData({ ...formData, release_year: parseInt(e.target.value) })}
            required
          />
        </div>
        <div className="form-group">
          <label>Rating:</label>
          <input
            type="number"
            min="1"
            max="5"
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
            required
          />
        </div>
        <div className="form-group">
          <label>Status:</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            required
          >
            <option value="Watched">Watched</option>
            <option value="Watching">Watching</option>
            <option value="Plan to Watch">Plan to Watch</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button type="submit">{movie ? 'Update' : 'Add'} Movie</button>
          <button type="button" onClick={onClose}>Cancel</button>
        </div>
      </form>
    </div>
  );
}

export default MovieForm;
