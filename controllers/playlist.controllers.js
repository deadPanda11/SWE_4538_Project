const Playlist = require('../dataModels/Playlist.model');
const path = require("path");

exports.getCreatePlaylist = async (req, res) => {
    const filePath = path.join(__dirname, "..", "views", "create-playlist.html");
    res.sendFile(filePath);
};

exports.postCreatePlaylist = async (req, res) => {
    const { title, description } = req.body;
    const userId = req.user.id;

    if (!title || !description) {
        return res.status(400).json({ error: "All fields are required!" });
    }

    try {
        const newPlaylist = new Playlist({ userId, title, description });
        await newPlaylist.save();
        res.redirect('/playlists');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPlaylistsByUserId = async (req, res) => {
    const userId = req.user.id;

    try {
        const playlists = await Playlist.find({ userId });
        res.render('playlists', { playlists });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getUpdatePlaylist = async (req, res) => {
    try {
        const playlistId = req.params.playlistId;
        const playlist = await Playlist.findById(playlistId);

        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found' });
        }

        res.render('update-playlist', { playlist });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updatePlaylist = async (req, res) => {
    const { playlistId } = req.params;
    const { title, description } = req.body;

    try {
        const playlist = await Playlist.findById(playlistId);

        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found' });
        }

        playlist.title = title || playlist.title;
        playlist.description = description || playlist.description;
        await playlist.save();
        res.redirect('/playlists');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deletePlaylist = async (req, res) => {
    const { playlistId } = req.params;

    try {
        const playlist = await Playlist.findByIdAndDelete(playlistId);
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found' });
        }
        res.json({ message: 'Playlist deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.uploadSong = async (req, res) => {
    try {
      const playlistId = req.params.playlistId;
      if (!req.files) {
        return res.status(400).json({ message: 'No songs added' });
      }
  
      const playlist = await Playlist.findById(playlistId);
      if (!playlist) {
        return res.status(404).json({ message: 'Playlist not found' });
      }
  
      const songs = req.files.map(file => file.filename);
      playlist.songs = playlist.songs.concat(songs);
      await playlist.save();
  
        res.redirect("/playlists");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  exports.getSongs = async (req, res) => {
    try {
        const { playlistId } = req.params;
        const playlist = await Playlist.findById(playlistId);
        if (!playlist) {
            return res.status(404).json({ message: 'Playlist not found' });
        }
        res.json({ songs: playlist.songs });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteSong = async (req, res) => {
    const { playlistId, songId } = req.params;

    try {
        const playlist = await Playlist.findById(playlistId);

        if (!playlist || !playlist.songs.includes(songId)) {
            return res.status(404).json({ message: 'Playlist or song not found' });
        }

        playlist.songs = playlist.songs.filter(song => song !== songId);
        await playlist.save();

        res.json({ message: 'Song removed successfully', playlist });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};