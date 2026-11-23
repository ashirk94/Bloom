import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, errorMessage } from "../api";
import { useSignedInUser } from "../context/AuthContext";
import type { UserResponse } from "../types";
import { ErrorMessage, SuccessMessage } from "../components/Message";

const MAX_LENGTH = 500;

export default function EditBio() {
	const { user, setUser } = useSignedInUser();
	// start with the current bio in the box, so it can be edited rather
	// than retyped from scratch
	const [bio, setBio] = useState(user.bio);
	const [saving, setSaving] = useState(false);
	const [success, setSuccess] = useState("");
	const [error, setError] = useState("");

	const handleSubmit = async (event: FormEvent) => {
		event.preventDefault();
		setSuccess("");
		setError("");
		setSaving(true);
		try {
			const data = await api<UserResponse>("/me", { method: "PATCH", body: { bio } });
			setUser(data.user);
			setSuccess("Bio updated!");
		} catch (err) {
			setError(errorMessage(err));
		} finally {
			setSaving(false);
		}
	};

	return (
		<div className="main-wrapper">
			<h1 className="title">My Bio</h1>
			<SuccessMessage>{success}</SuccessMessage>
			<ErrorMessage>{error}</ErrorMessage>
			<form onSubmit={handleSubmit}>
				<label htmlFor="bio">Tell people a little about yourself</label>
				<br />
				<textarea
					id="bio"
					maxLength={MAX_LENGTH}
					value={bio}
					onChange={(event) => setBio(event.target.value)}
				/>
				<div>
					{bio.length} / {MAX_LENGTH}
				</div>
				<div className="btn-group">
					<Link to="/profile" className="btn btn-secondary">
						Back to Profile
					</Link>
					<button type="submit" className="btn btn-primary" disabled={saving}>
						{saving ? "Saving..." : "Update Bio"}
					</button>
				</div>
			</form>
		</div>
	);
}
