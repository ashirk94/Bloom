import { useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { api, errorMessage } from "../api";
import { useSignedInUser } from "../context/AuthContext";
import type { UserResponse } from "../types";
import { getPosition } from "../lib/geolocation";
import { ErrorMessage, SuccessMessage } from "../components/Message";

type Action = "name" | "photo" | "location";

export default function Profile() {
	const { user, setUser } = useSignedInUser();
	const [displayName, setDisplayName] = useState(user.displayName);
	// useState(null) alone would mean "always null"; the <File | null> says
	// what it may hold later
	const [photo, setPhoto] = useState<File | null>(null);
	const [photoPreview, setPhotoPreview] = useState<string | null>(null);
	// Changing a component's `key` makes React replace it with a fresh one.
	// File inputs can't be cleared through `value`, so this empties it.
	const [fileInputKey, setFileInputKey] = useState(0);
	const [busy, setBusy] = useState<"" | Action>(""); // which action is in progress
	const [success, setSuccess] = useState("");
	const [error, setError] = useState("");

	useEffect(() => {
		if (!photo) {
			setPhotoPreview(null);
			return;
		}
		const url = URL.createObjectURL(photo);
		setPhotoPreview(url);
		return () => URL.revokeObjectURL(url);
	}, [photo]);

	// Every action on this page follows the same pattern: show progress,
	// call the API, store the updated user, report success or failure.
	// Writing it once keeps the three handlers below short.
	const run = async (
		name: Action,
		successText: string,
		action: () => Promise<UserResponse>
	) => {
		setBusy(name);
		setSuccess("");
		setError("");
		try {
			const data = await action();
			setUser(data.user);
			setSuccess(successText);
		} catch (err) {
			setError(errorMessage(err));
		} finally {
			setBusy("");
		}
	};

	const saveDisplayName = (event: FormEvent) => {
		event.preventDefault();
		run("name", "Display name updated!", () =>
			api<UserResponse>("/me", { method: "PATCH", body: { displayName } })
		);
	};

	const savePhoto = (event: FormEvent) => {
		event.preventDefault();
		if (!photo) return;
		const formData = new FormData();
		formData.append("image", photo);
		run("photo", "Profile picture updated!", async () => {
			const data = await api<UserResponse>("/me/avatar", { method: "PUT", formData });
			setPhoto(null);
			setFileInputKey((k) => k + 1);
			return data;
		});
	};

	const saveLocation = () => {
		run("location", "Location updated!", async () => {
			const { lat, lon } = await getPosition();
			return api<UserResponse>("/me", { method: "PATCH", body: { lat, lon } });
		});
	};

	return (
		<div className="main-wrapper">
			<h1 className="title">My Profile</h1>
			<h2 className="subtitle">Email: {user.email}</h2>

			<div className="profile-section">
				<h3>🏷️ Display Name</h3>
				<form onSubmit={saveDisplayName} className="inline-form">
					<input
						type="text"
						className="form-input"
						aria-label="Display name"
						placeholder="Enter your first name"
						maxLength={50}
						value={displayName}
						onChange={(event) => setDisplayName(event.target.value)}
						required
					/>
					<button
						type="submit"
						className="btn btn-primary btn-small"
						disabled={busy === "name"}
					>
						Update
					</button>
				</form>
			</div>

			<div className="side-by-side-sections">
				<div className="profile-section half-width">
					<h3>📸 Profile Picture</h3>
					<form onSubmit={savePhoto}>
						<input
							key={fileInputKey}
							type="file"
							aria-label="Choose a profile picture"
							accept="image/png, image/jpeg"
							className="file-input"
							onChange={(event) => setPhoto(event.target.files?.[0] ?? null)}
						/>
						<div id="fileDisplayArea">
							<img
								src={photoPreview || user.avatarUrl}
								alt={photoPreview ? "New picture preview" : "Current profile picture"}
							/>
						</div>
						{photo && (
							<button
								type="submit"
								className="btn btn-primary btn-small"
								disabled={busy === "photo"}
							>
								{busy === "photo" ? "Uploading..." : "Update Picture"}
							</button>
						)}
					</form>
				</div>

				<div className="profile-section half-width">
					<h3>📍 Location</h3>
					{user.hasLocation ? (
						<p className="location-set">
							✅ Location set - Ready to find friends nearby!
						</p>
					) : (
						<p className="location-needed">
							⚠️ Location needed to find friends in your area
						</p>
					)}
					<button
						type="button"
						className="btn btn-primary btn-small"
						onClick={saveLocation}
						disabled={busy === "location"}
					>
						{busy === "location" ? "Getting location..." : "Update Location"}
					</button>
				</div>
			</div>

			<div className="btn-group">
				<Link to="/interests" className="btn btn-secondary">
					Edit Interests
				</Link>
				<Link to="/values" className="btn btn-secondary">
					Edit Values
				</Link>
				<Link to="/bio" className="btn btn-secondary">
					Edit Bio
				</Link>
			</div>
			<SuccessMessage>{success}</SuccessMessage>
			<ErrorMessage>{error}</ErrorMessage>
		</div>
	);
}
