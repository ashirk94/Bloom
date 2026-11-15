// navigator.geolocation uses callbacks; wrapping it in a Promise lets
// components simply `await getPosition()`.
export function getPosition() {
	return new Promise((resolve, reject) => {
		if (!navigator.geolocation) {
			reject(new Error("Geolocation is not supported by this browser."));
			return;
		}
		navigator.geolocation.getCurrentPosition(
			(position) =>
				resolve({
					lat: position.coords.latitude,
					lon: position.coords.longitude
				}),
			() =>
				reject(
					new Error(
						"Couldn't get your location. Please allow location access in your browser."
					)
				)
		);
	});
}
