// HTTP headers that tell the browser to lock the site down. (The popular
// "helmet" package does the same job; these few lines avoid a dependency.)

// Content-Security-Policy lists where the page may load things from. If an
// attacker ever managed to inject a <script> tag, the browser would refuse
// to run it, because inline scripts and other sites aren't on the list.
const CSP = [
	"default-src 'self'",
	"script-src 'self'",
	// the Google Fonts stylesheet imported in styles.css, and its font files
	"style-src 'self' https://fonts.googleapis.com",
	"font-src 'self' https://fonts.gstatic.com",
	// blob: is the preview of a picture before it's uploaded
	"img-src 'self' data: blob:",
	// API calls and the socket.io connection go to this same site
	"connect-src 'self'",
	"object-src 'none'",
	"base-uri 'self'",
	"form-action 'self'",
	// nobody may show Bloom inside a frame on their own site ("clickjacking")
	"frame-ancestors 'none'"
].join("; ");

function securityHeaders(req, res, next) {
	res.set({
		"Content-Security-Policy": CSP,
		// trust the Content-Type we send; never "guess" that an uploaded image
		// is really HTML or JavaScript
		"X-Content-Type-Options": "nosniff",
		// older browsers' version of frame-ancestors
		"X-Frame-Options": "DENY",
		// don't leak full URLs (which contain user ids) to other sites
		"Referrer-Policy": "same-origin"
	});
	next();
}

// Extra protection against cross-site request forgery (CSRF): a request that
// changes something must come from a page on this site. Browsers always add
// an Origin header to such requests, and a web page cannot fake it. The
// SameSite cookie setting already blocks most of these; this catches the
// rest (for example a sibling subdomain, which counts as the "same site").
const SAFE_METHODS = ["GET", "HEAD", "OPTIONS"];

function isSameOrigin(req) {
	const origin = req.headers.origin;
	// no Origin header: not a cross-site browser request (e.g. curl, tests)
	if (!origin) return true;
	try {
		return new URL(origin).host === req.headers.host;
	} catch (err) {
		return false;
	}
}

function requireSameOrigin(req, res, next) {
	if (SAFE_METHODS.includes(req.method) || isSameOrigin(req)) return next();
	res.status(403).json({ error: "Request blocked." });
}

module.exports = { securityHeaders, requireSameOrigin, isSameOrigin };
