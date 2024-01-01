const express = require("express");
const router = express.Router();
const { uploadUserProfileImage } = require('../middlewares/image.middleware');
const {
    getLogin,
    getRegister,
    postLogin,
    postRegister,
    getHomepage,
    getUpdateProfile,
    updateProfile,
    getProfile,
    deleteProfile,
    getForgotPassword,
    postForgotPassword,
    getResetPassword,
    postResetPassword,
    } = require("../controllers/auth.controllers");

router.get("/login", getLogin);
router.post("/login", postLogin);
router.get("/register", getRegister);
router.post("/register", postRegister);
router.get("/homepage", getHomepage);
router.get("/forgot-password", getForgotPassword);
router.post("/request-reset-password", postForgotPassword);
router.get("/reset-password/:token", getResetPassword);
router.post("/reset-password/:token", postResetPassword);
router.get("/profile", getProfile);
router.get("/update-profile/:id", getUpdateProfile);
router.post("/update-profile/:id", uploadUserProfileImage.single('profileImage'), updateProfile);
router.post("/delete-profile/:id", deleteProfile);

module.exports = router;