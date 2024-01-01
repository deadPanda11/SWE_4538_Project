const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: function() { return !this.isOAuth; } // The password is required if it's not an OAuth account
  },
  isOAuth: {
    type: Boolean,
    default: false,
  },
  profession: {
    type: String,
    default:'',
  },
  hobby: {
    type: String,
    default:'',
  },
  profile_image: {
    type: String,
    default:'',
  },
  resetPasswordToken: String,
  resetPasswordExpires: Date,
});

const User = mongoose.model("User", UserSchema);
module.exports = User;