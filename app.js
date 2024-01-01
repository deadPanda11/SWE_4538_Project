const express = require("express");
const app = express();
const User = require("./dataModels/User.model");
const bodyParser = require("body-parser"); // parse the body of HTTP request
const cookieParser = require("cookie-parser"); //parse cookies that are sent with HTTP request
const session = require("express-session");
const flash = require('express-flash')
const passport = require("passport");
const ejs = require('ejs');
const path = require("path");
require("./config/passport")(passport);


function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}
const GoogleStrategy = require('passport-google-oauth20').Strategy;

app.use(flash());
app.use(
  session({
    secret:"secret",
    resave: false,  
    saveUninitialized: false,  
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new GoogleStrategy({
    clientID: '386455827500-nd4q5pffh1au1gbnu7beqf7q2a6ff1ke.apps.googleusercontent.com',
    clientSecret: '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',
    callbackURL: 'http://localhost:3000/google/callback' 
  },
  async function(request, accessToken, refreshToken, profile, done) {
    try {
        const user = await User.findOne({
          $or: [
            { googleId: profile.id },
            { email: profile.emails[0].value }
          ]
        });
      
        if (user) {
          console.log("User already exists")
          return done(null, user);
        }

        const newUser = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          googleId: profile.id,
          isOAuth: true,
        });

        await newUser.save();

        return done(null, newUser);
      } catch (error) {
        return done(error);
      }
    }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});


passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
  console.log(user)
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});


app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/google/callback',
passport.authenticate( 'google', {
  successRedirect: '/protected',
  failureRedirect: '/auth/failure'
})
);

app.get('/protected', isLoggedIn, (req, res) => {
  const htmlWithScript = `
    <script>
      alert('Login successful');
      window.location.href = '/welcome'; // Change to your actual welcome page URL
    </script>
  `;
  res.send(htmlWithScript);
});

app.get('/auth/failure', (req, res) => {
  res.send('Failed to authenticate..');
});


app.set('view engine', 'ejs');


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));


const cors = require("cors");   //Cross-origin resource sharing (CORS) is a browser mechanism which
                                  //  enables controlled access to resources located outside of a given domain.
app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true, // Allow cookies to be sent
}));

const routes = require("./routes/auth.routes");
app.use(routes);

const playlistRoutes = require("./routes/playlist.routes");
app.use(playlistRoutes);

const ensureAuthenticated = require("./middlewares/auth.middleware");
app.get("/welcome", ensureAuthenticated, (req, res) => {
  res.sendFile(__dirname + "/views/homePage.html");
});


app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error destroying session:', err);
            return res.status(500).send('Internal Server Error');
        }

        res.redirect('/login');
    });
});



//Connect to DB
const mongoose = require("mongoose");
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to Database!");
  })
  .catch((error) => {
    console.log(error);
  });


module.exports = app;
