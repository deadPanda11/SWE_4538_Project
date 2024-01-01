const mongoose = require('mongoose');

const playlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  songs: [{ type: String }],
}, { timestamps: true });

const Playlist = mongoose.model('Playlist', playlistSchema);

module.exports = Playlist;