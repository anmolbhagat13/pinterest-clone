var express = require('express');
var router = express.Router();
const userModel = require("./users");
const postModel = require("./posts");
const passport = require('passport');
const upload = require('./multer');

const localStrategy = require("passport-local");
passport.use(new localStrategy(userModel.authenticate()));

router.get('/', function (req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/login', function (req, res, next) {
  res.render('login', { error: req.flash('error') });
});

router.get('/feed', async function (req, res, next) {
  res.render("feed");
});

router.post('/uploads', isLoggedIn, upload.single('file'), async function (req, res, next) {
  if (!req.file) {
    return res.status(404).send("no files were given");
  }
  const user = await userModel.findOne({ username: req.session.passport.user });
  const post = await postModel.create({
    image: req.file.filename,
    imageText: req.body.filecaption,
    user: user._id
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect("/profile");
});

router.get('/profile', isLoggedIn, async function (req, res, next) {
  try {
    const user = await userModel
      .findOne({ username: req.session.passport.user })
      .populate("posts");

    if (!user) {
      return res.status(404).send("User not found");
    }
    res.render('profile', { user });
  } catch (err) {
    next(err);
  }
});

router.get("/profile-edit", isLoggedIn, async function (req, res, next) {
  try {
    const user = await userModel.findById(req.user._id);

    if (!user) {
      return res.redirect("/login");
    }

    res.render("profile-edit", { user });
  } catch (err) {
    next(err);
  }
});


router.post("/profile-edit", isLoggedIn, (req, res, next) => {
  upload.single("dp")(req, res, async function (err) {
    if (err) {
      return res.status(400).send("Image upload failed.");
    }

    try {
      const { fullname, username, email } = req.body;

      if (
        !fullname?.trim() ||
        !username?.trim() ||
        !email?.trim()
      ) {
        return res.status(400).send("All fields are required.");
      }

      const cleanUsername = username.trim();
      const cleanEmail = email.trim().toLowerCase();
      const existingUser = await userModel.findOne({
        _id: { $ne: req.user._id },
        $or: [
          { username: cleanUsername },
          { email: cleanEmail }
        ]
      });

      if (existingUser) {
        return res.status(400).send("Username or email is already in use.");
      }

      const user = await userModel.findById(req.user._id);

      if (!user) {
        return res.redirect("/login");
      }

      user.fullname = fullname.trim();
      user.username = cleanUsername;
      user.email = cleanEmail;

      if (req.file) {
        user.dp = "/images/uploads/" + req.file.filename;
      }

      await user.save();

      res.redirect("/profile");

    } catch (error) {
      next(error);
    }
  });
});

router.post('/register', function (req, res) {
  const { username, email, fullname } = req.body;
  const userData = new userModel({ username, email, fullname });

  userModel.register(userData, req.body.password)
    .then(function () {
      passport.authenticate("local")(req, res, function () {
        res.redirect("/feed");
      })
    })
})

router.post('/login', passport.authenticate("local", {
  successRedirect: '/feed',
  failureRedirect: '/login',
  failureFlash: true
}), function (req, res) {
})

router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
})

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}

module.exports = router;
