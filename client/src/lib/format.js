// `undefined` means "use the reader's own language and time zone"
const timeFormat = new Intl.DateTimeFormat(undefined, {
	dateStyle: "medium",
	timeStyle: "short"
});

export function formatTime(isoString) {
	const date = new Date(isoString);
	return isNaN(date) ? "" : timeFormat.format(date);
}
