const router = require("express").Router();

router.get("/privacy-policy", (req, res) => {
	res.render("info/privacy-policy", { user: req.user });
});

router.get("/terms-of-service", (req, res) => {
	res.render("info/terms-of-service", { user: req.user });
});

module.exports = router;
