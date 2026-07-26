module.exports = (req, res, next) => {
  if (req.session && req.session.user) {
    req.flash("error", "Error");
    return res.redirect("/profilepage"); 
  }

  next(); 
};
