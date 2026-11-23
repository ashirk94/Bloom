// `undefined` means "use the reader's own language and time zone"
const timeFormat = new Intl.DateTimeFormat(undefined, {
	dateStyle: "medium",
	timeStyle: "short"
});

export function formatTime(isoString: string): string {
	const date = new Date(isoString);
	return isNaN(date.getTime()) ? "" : timeFormat.format(date);
}
