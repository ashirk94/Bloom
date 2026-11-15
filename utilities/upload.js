const multer = require("multer");
const { HttpError } = require("./errors");

const ALLOWED_TYPES = ["image/png", "image/jpeg"];

// Profile picture uploads.
// memoryStorage keeps the upload in RAM as `req.file.buffer`. The old code
// wrote it into the public folder first (where anyone could request it),
// read it back, then deleted it - and this config existed in two files.
const upload = multer({
	storage: multer.memoryStorage(),
	limits: { fileSize: 5 * 1024 * 1024, files: 1, fields: 5 }, // 5 MB
	fileFilter: (req, file, cb) => {
		if (ALLOWED_TYPES.includes(file.mimetype)) {
			cb(null, true);
		} else {
			cb(new HttpError(400, "Only .png and .jpg images are allowed."));
		}
	}
});

// The type the browser reports can be faked, so also check the first bytes
// of the file, which are always the same for a real PNG or JPEG.
function detectImageType(buffer) {
	if (!buffer || buffer.length < 8) return null;
	const isPng = buffer
		.subarray(0, 8)
		.equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
	if (isPng) return "image/png";
	const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
	if (isJpeg) return "image/jpeg";
	return null;
}

module.exports = { upload, detectImageType };
