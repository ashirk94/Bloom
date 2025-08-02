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
