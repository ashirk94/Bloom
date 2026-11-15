import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useApi } from "../lib/useApi.js";
import RankedPicker from "../components/RankedPicker.jsx";
import Loader from "../components/Loader.jsx";
import { ErrorMessage, SuccessMessage } from "../components/Message.jsx";

// One page component for both /interests and /values.
// `kind` is "interests" or "values" and doubles as the field name in the
// user object, the options object and the API request.
export default function EditRanked({ kind }) {
	const { user, setUser } = useAuth();
	const { data: options, error: loadError } = useApi("/options");
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

	const handleSubmit = async (event) => {
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
			const data = await api("/me", { method: "PATCH", body: { [kind]: selected } });
			setUser(data.user);
			setSuccess("Profile updated!");
		} catch (err) {
			setError(err.message);
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
