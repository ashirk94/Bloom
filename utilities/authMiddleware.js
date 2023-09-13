//checking if users are authorized
module.exports.isAuth = (req, res, next) => {
  if (req.isAuthenticated()) {
    next();
  } else {
    res.render("auth/unauthorized");
  }
};
//auth and admin check
module.exports.isAdmin = (req, res, next) => {
  if (req.isAuthenticated() && req.user.admin) {
    next();
  } else {
    res.render("auth/unauthorized");
  }
};
//email verification check
module.exports.isVerified = (req, res, next) => {
  if (req.user.confirmed) {
    next();
  } else {
    res.redirect("/unverified");
  }
};
