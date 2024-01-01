const fs = require('fs');
const User = require("../dataModels/User.model");
const path = require("path");
const bcrypt = require("bcrypt");
const passport = require("passport");
const nodemailer = require('nodemailer');
const crypto = require('crypto');


const getLogin = async (req, res) => {
  const filePath = path.join(__dirname, "..", "views", "login.html");
  res.sendFile(filePath);
};


const postLogin = (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/homepage",
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next);
};


const getRegister = async (req, res) => {
  const filePath = path.join(__dirname, "..", "views", "register.html");
  res.sendFile(filePath);
};


const postRegister = async (req, res, next) => {
  const {  email, password } = req.body;
  const name= req.body.username

  console.log(name)
  console.log(email)
  console.log(password)

const errors=[]
if (!name || !email || !password ) {
  errors.push("All fields are required!");
}

if (errors.length > 0) {
  res.status(400).json({ error: errors });
} else {
  User.findOne({ email: email }).then((user) => {
    if (user) {
      errors.push("User already exists with this email!");
      res.status(400).json({ error: errors });
    } else {
      bcrypt.genSalt(10, (err, salt) => {
        if (err) {
          errors.push(err);
          res.status(400).json({ error: errors });
        } else {
          bcrypt.hash(password, salt, (err, hash) => {
            if (err) {
              errors.push(err);
              res.status(400).json({ error: errors });
            } else {
              const newUser = new User({
                name,
                email,
                password: hash,
              });
              newUser
                .save()
                .then(() => {
                  res.redirect("/login");
                })
                .catch(() => {
                  errors.push("Please try again");
                  res.status(400).json({ error: errors });
                });
            }
          });
        }
      });
    }
  });
}
};


const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT, 10),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD
  }
});


const getForgotPassword = (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'views', 'forgot-password.html'));
};


const postForgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = await User.findOne({ email: email });
  if (!user) {
    return res.status(400).json({ error: 'User not found' });
  }

  const token = crypto.randomBytes(20).toString('hex'); 

  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000;

  await user.save();
  console.log('Generated token:', token); 

  const mailOptions = {
    to: user.email,
    subject: 'Password Reset',
    text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
          'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
          `http://${req.headers.host}/reset-password/${token}\n\n` + 
          'If you did not request this, please ignore this email and your password will remain unchanged.\n',
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error); 
      return res.status(500).json({ error: 'Error sending email', details: error.toString() });
    }
    res.redirect("/login");
    // res.status(200).json({ message: 'Email sent', info: info.response });
  });
};


const getResetPassword = async (req, res) => {
  const { token } = req.params;

  let htmlContent = fs.readFileSync(path.join(__dirname, '..', 'views', 'reset-password.html'), 'utf8');

  htmlContent = htmlContent.replace('{{token}}', token);

  res.send(htmlContent);
};


const postResetPassword = async (req, res) => {
  const { token } = req.params;

  const { password } = req.body;

  console.log('Received token:', token); 
  console.log('Received password:', password);

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    console.log('User found:', user); 

    if (!user) {
      console.error('Password reset token is invalid or has expired');
      return res.status(400).json({ error: 'Password reset token is invalid or has expired' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: 'Password has been updated' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


const getHomepage = async (req, res) => {
  const filePath = path.join(__dirname, "..", "views", "homePage.html");
  res.sendFile(filePath);
};


const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select('-password');

    res.render('profile', { user });
  } catch (error) {
    res.status(500).send('Internal Server Error');
  }
};


const getUpdateProfile = async (req, res) => {
  const currentUserId = req.params.id;
  const currentUser = await User.findById(currentUserId);

    if (!currentUser) {
        return res.redirect('/login'); 
    }

    res.render('update-profile', { user: currentUser });
};


const updateProfile = async (req, res) => {
  const { id } = req.params;
  const { name, hobby, profession } = req.body;
  console.log(id);
  console.log(name);
  console.log(hobby);
  console.log(profession);

    try {
        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

      user.name = name || user.name;
      user.hobby = hobby || user.hobby;
      user.profession = profession || user.profession;

      if (req.file) {
        user.profile_image = req.file.filename;
      }
        
      await user.save();
      
      res.redirect('/profile');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


const deleteProfile = async (req, res) => {
  try {
    const profileID = req.params.id;
    const profileInfo = await User.findById(profileID);

    if (!profileInfo) {
      return res.status(404).json({ error: "Profile information not found" });
    }

    await profileInfo.deleteOne({ _id: profileID });

    res.json({ message: "Profile information deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const postProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }
const photo = req.file.filename
    
    const userId = req.user.id
    const user = await User.findById(userId);
    console.log(user)


    if (photo) {
      user.profile_image = photo
    }
    await user.save();

    res.json({ message: 'Profile image updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const postMultipleImages = async (req, res) => {
  try {
    if (!req.files) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const photo = req.files.map((file) => file.filename);

    const userId = req.user.id
    const user = await User.findById(userId);
   
    if (photo) {
      user.images = photo
    }
    await user.save();

    res.json({ message: 'Multiple images updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getMultipleImages = async (req, res) => {
  try {
    const userId = req.user.id
    const user = await User.findById(userId);
    const images= user.images

    res.json({ images });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


const postAudioFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }
const audio = req.file.filename
    
    const userId = req.user.id
    const user = await User.findById(userId);
    console.log(user)


    if (audio) {
      user.audio = audio
    }
    await user.save();

    res.json({ message: 'Audio updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getLogin,
  getRegister,
  postLogin,
  postRegister,
  getHomepage,
  getForgotPassword,
  postForgotPassword,
  getResetPassword,
  postResetPassword,
  getProfile,
  getUpdateProfile,
  updateProfile,
  deleteProfile,
  postProfileImage,
  postMultipleImages,
  getMultipleImages,
  postAudioFile,
};

