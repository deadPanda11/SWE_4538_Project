const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlist.controllers');
const ensureAuthenticated = require('../middlewares/auth.middleware');
const { uploadSong } = require('../middlewares/image.middleware');

router.get('/create-playlist', ensureAuthenticated, playlistController.getCreatePlaylist);
router.post('/create-playlist', ensureAuthenticated, playlistController.postCreatePlaylist);
router.get('/playlists', ensureAuthenticated, playlistController.getPlaylistsByUserId);
router.get('/update-playlist/:playlistId', ensureAuthenticated, playlistController.getUpdatePlaylist);
router.post('/update-playlist/:playlistId', ensureAuthenticated, playlistController.updatePlaylist);
router.delete('/delete-playlist/:playlistId', ensureAuthenticated, playlistController.deletePlaylist);

router.get('/upload-song/:playlistId', ensureAuthenticated, (req, res) => {
    const playlistId = req.params.playlistId;
    res.render('upload-song', { playlistId });
});
router.post('/upload-song/:playlistId', ensureAuthenticated, uploadSong.array('songs', 30), (req, res) => {
    playlistController.uploadSong(req, res);
});

router.get('/playlists/:playlistId/songs', ensureAuthenticated, playlistController.getSongs);
router.delete('/playlists/:playlistId/songs/:songId', ensureAuthenticated, playlistController.deleteSong);


module.exports = router;