const shortid = require("shortid");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const User = require("../models/user");

exports.signup = async (req, res) => {
  User.findOne({ email: req.body.email }).exec((err, user) => {
    if (user) {
      return res.status(400).json({
        error: "Email is taken",
      });
    } else {
      const { name, email, password } = req.body;

      let username = shortid.generate();
      let profile = `${process.env.CLIENT_URL}/profile/${username}`;

      let newUser = User({ name, email, password, profile, username });

      newUser.save((err, success) => {
        if (err) {
          return res.status(400).json({
            error: err,
          });
        }

        res.json({
          message: "Signup success! Please signin.",
        });
      });
    }
  });
};

exports.signin = (req, res) => {
  const { email, password } = req.body;

  //check if user exist
  User.findOne({ email }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User with that email doesnot exist. Please sign up",
      });
    }

    //authenticate
    if (!user.authenticate(password)) {
      return res.status(400).json({
        error: "Email and password do not match.",
      });
    }

    // generate a token and send to  client
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.cookie("token", token, { expiresIn: "1d" });

    const { _id, username, name, email, role } = user;
    return res.json({
      token,
      user: { _id, username, name, email, role },
    });
  });
};

exports.signout = (req, res) => {
  res.clearCookie("token");
  res.json({
    message: "Signout success",
  });
};

exports.requireSignin = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(400).json({
      error: "Unauthorized request, Try again.",
    });
  }

  const token = authorization.split(" ")[1];

  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  if (decoded) {
    req.user = decoded;
    next();
  } else {
    return res.status(400).json({
      error: "Unauthorized token, Use correct Token.",
    });
  }
};

exports.authMiddleware = (req, res, next) => {
  const authUserId = req.user._id;
  User.findById({ _id: authUserId }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }

    req.profile = user;
    next();
  });
};

exports.adminMiddleware = (req, res, next) => {
  const adminUserId = req.user._id;
  User.findById({ _id: adminUserId }).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "User not found",
      });
    }

    if (user.role !== 1) {
      return res.status(400).json({
        error: "admin resource, access denied",
      });
    }

    req.profile = user;
    next();
  });
};
