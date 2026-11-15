import { useState } from "react";
import { api } from "../api.js";

// Sends (or accepts) a friend request.
// The button only changes to its "done" state after the server confirms.
// The old scripts changed the button first and never checked the response,
// so a failed request still looked like it had worked.
export default function LikeButton({
	userId,
	label,
	doneLabel,
	className = "btn btn-primary",
	onDone
}) {
	const [status, setStatus] = useState("idle"); // idle | sending | done | error

	const handleClick = async () => {
		setStatus("sending");
		try {
			const result = await api(`/users/${userId}/like`, { method: "POST" });
			setStatus("done");
			onDone?.(result);
		} catch (err) {
			setStatus("error");
		}
	};

	if (status === "done") {
		return (
			<button className={`${className} btn-liked`} disabled>
				{doneLabel}
			</button>
		);
	}

	return (
		<button
			className={className}
			onClick={handleClick}
			disabled={status === "sending"}
		>
			{status === "error" ? "Didn't work - try again" : label}
		</button>
	);
}
