import { useState } from "react";
import { api } from "../api";
import type { LikeResponse } from "../types";

interface LikeButtonProps {
	userId: string;
	label: string;
	doneLabel: string;
	className?: string;
	// the `?` makes it optional: called with the answer once it worked
	onDone?: (result: LikeResponse) => void;
}

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
}: LikeButtonProps) {
	// a "union" of the four allowed strings; any other value is an error
	const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

	const handleClick = async () => {
		setStatus("sending");
		try {
			const result = await api<LikeResponse>(`/users/${userId}/like`, { method: "POST" });
			setStatus("done");
			onDone?.(result);
		} catch {
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
