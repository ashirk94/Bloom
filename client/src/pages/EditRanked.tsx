import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, errorMessage } from "../api";
import { useSignedInUser } from "../context/AuthContext";
import type { OptionsResponse, RankedKind, UserResponse } from "../types";
import { useApi } from "../lib/useApi";
import RankedPicker from "../components/RankedPicker";
import Loader from "../components/Loader";
import { ErrorMessage, SuccessMessage } from "../components/Message";

// One page component for both /interests and /values.
// `kind` is "interests" or "values" and doubles as the field name in the
// user object, the options object and the API request.
// `kind` can only be "interests" or "values", so user[kind] and options[kind]
// are known to exist: TypeScript checks this for us
export default function EditRanked({ kind }: { kind: RankedKind }) {
	const { user, setUser } = useSignedInUser();
	const { data: options, error: loadError } = useApi<OptionsResponse>("/options");
	const [selected, setSelected] = useState(user[kind]);
	const [saving, setSaving] = useState(false);
	const [success, setSuccess] = useState("");
	const [error, setError] = useState("");

	const singular = kind === "interests" ? "interest" : "value";

	if (loadError) {
		return (
			<div className="main-wrapper">
				<ErrorMessage>{loadError}</ErrorMessage>
			</div>
		);
	}
	if (!options) return <Loader />;

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		setSuccess("");
		setError("");
		if (selected.length === 0) {
			setError(`Please select at least one ${singular}.`);
			return;
		}
		setSaving(true);
		try {
			// [kind] uses the variable's value as the property name
			const data = await api<UserResponse>("/me", { method: "PATCH", body: { [kind]: selected } });
			setUser(data.user);
			setSuccess("Profile updated!");
		} catch (err) {
			setError(errorMessage(err));
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="main-wrapper picker-page">
			<h1 className="title">Select &amp; Rank Your {kind === "interests" ? "Interests" : "Values"}</h1>
			<p className="picker-hint">
				Choose up to {options.maxRanked} {kind} and rank them in order of
				importance (1 = most important)
			</p>
			<SuccessMessage>{success}</SuccessMessage>
			<ErrorMessage>{error}</ErrorMessage>

			<form onSubmit={handleSubmit}>
				<RankedPicker
					options={options[kind]}
					max={options.maxRanked}
					value={selected}
					onChange={setSelected}
				/>
				<div className="btn-group">
					<Link to="/profile" className="btn btn-secondary">
						Back to Profile
					</Link>
					<button type="submit" className="btn btn-primary" disabled={saving}>
						{saving ? "Saving..." : `Save ${kind === "interests" ? "Interests" : "Values"}`}
					</button>
				</div>
			</form>
		</div>
	);
}
