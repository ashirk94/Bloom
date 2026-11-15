import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useApi } from "../lib/useApi.js";
import { getPosition } from "../lib/geolocation.js";
import { isValidEmail, passwordProblem } from "../lib/validation.js";
import PasswordInput from "../components/PasswordInput.jsx";
import RankedPicker from "../components/RankedPicker.jsx";
import { ErrorMessage } from "../components/Message.jsx";
import Loader from "../components/Loader.jsx";

// The four-step sign-up form.
// All the answers live in one `form` object, and `step` decides which part
// is on screen. Nothing is sent to the server until the last step.
export default function Register() {
	const { user, register, setUser } = useAuth();
	const navigate = useNavigate();
	const { data: options, error: optionsError } = useApi("/options");

	const [step, setStep] = useState(1);
	const [form, setForm] = useState({
		email: "",
		displayName: "",
		password: "",
		confirm: "",
		bio: "",
		interests: [],
		values: []
	});
	const [photo, setPhoto] = useState(null);
	const [photoPreview, setPhotoPreview] = useState(null);
	const [position, setPosition] = useState(null);
	const [locationStatus, setLocationStatus] = useState("");
	const [error, setError] = useState("");
	const [submitting, setSubmitting] = useState(false);

	// update one field and keep the rest ("spread" copies the old object)
	const setField = (name, value) =>
		setForm((current) => ({ ...current, [name]: value }));

	// Build a temporary URL to preview the chosen photo, and release it
	// again when the photo changes or the page closes.
	useEffect(() => {
		if (!photo) {
			setPhotoPreview(null);
			return;
		}
		const url = URL.createObjectURL(photo);
		setPhotoPreview(url);
		return () => URL.revokeObjectURL(url);
	}, [photo]);

	// already signed in (and not in the middle of signing up)
	if (user && !submitting) return <Navigate to="/profile" replace />;
	if (optionsError) {
		return (
			<div className="login-wrapper">
				<ErrorMessage>{optionsError}</ErrorMessage>
			</div>
		);
	}
	if (!options) return <Loader />;

	// returns a message if the current step isn't finished, otherwise null
	const problemWithStep = () => {
		if (step === 1) {
			if (!isValidEmail(form.email.trim())) {
				return "Please enter a valid email address.";
			}
			if (!form.displayName.trim()) return "Please enter a display name.";
			const problem = passwordProblem(form.password);
			if (problem) return problem;
			if (form.password !== form.confirm) return "Passwords do not match.";
		}
		if (step === 3 && form.interests.length === 0) {
			return "Please select at least one interest.";
		}
		if (step === 4 && form.values.length === 0) {
			return "Please select at least one value.";
		}
		return null;
	};

	const goNext = () => {
		const problem = problemWithStep();
		setError(problem || "");
		if (!problem) setStep(step + 1);
	};

	const goBack = () => {
		setError("");
		setStep(step - 1);
	};

	const findLocation = async () => {
		setLocationStatus("Finding your location...");
		try {
			setPosition(await getPosition());
			setLocationStatus("✅ Location captured successfully!");
		} catch (err) {
			setLocationStatus(`❌ ${err.message}`);
		}
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		// Pressing Enter in a text box submits the form, even on the early
		// steps. Treat that as "Next" instead of creating the account with
		// the interests and values steps skipped.
		if (step < 4) {
			goNext();
			return;
		}
		const problem = problemWithStep();
		if (problem) {
			setError(problem);
			return;
		}

		setError("");
		setSubmitting(true);
		try {
			await register({
				email: form.email.trim(),
				password: form.password,
				displayName: form.displayName.trim(),
				bio: form.bio,
				interests: form.interests,
				values: form.values,
				lat: position?.lat,
				lon: position?.lon
			});

			// the account exists now, so the photo can be uploaded as that user
			if (photo) {
				const formData = new FormData();
				formData.append("image", photo);
				try {
					const data = await api("/me/avatar", { method: "PUT", formData });
					setUser(data.user);
				} catch (err) {
					// the account was still created; they can retry on the profile page
				}
			}
			navigate("/profile", { replace: true });
		} catch (err) {
			setError(err.message);
			setSubmitting(false);
		}
	};

	return (
		<div className="login-wrapper register-wrapper">
			<h1 className="title">Create Your Account</h1>
			<h2 className="subtitle">Complete your profile to find amazing friends!</h2>
			<ErrorMessage>{error}</ErrorMessage>

			<form onSubmit={handleSubmit} autoComplete="off" noValidate>
				{step === 1 && (
					<div id="step-1">
						<h3>Step 1: Basic Information</h3>
						<input
							type="text"
							inputMode="email"
							placeholder="Email Address"
							aria-label="Email Address"
							value={form.email}
							onChange={(event) => setField("email", event.target.value)}
						/>
						<input
							type="text"
							placeholder="Display Name (First Name)"
							aria-label="Display Name"
							maxLength={50}
							value={form.displayName}
							onChange={(event) => setField("displayName", event.target.value)}
						/>
						<PasswordInput
							label="Password"
							autoComplete="new-password"
							value={form.password}
							onChange={(event) => setField("password", event.target.value)}
						/>
						<PasswordInput
							label="Re-enter Password"
							autoComplete="new-password"
							value={form.confirm}
							onChange={(event) => setField("confirm", event.target.value)}
						/>
						<button type="button" className="btn btn-primary" onClick={goNext}>
							Next: Bio &amp; Location
						</button>
						<p>
							<Link to="/login" className="default-text-color">
								Already have an account? Sign in
							</Link>
						</p>
					</div>
				)}

				{step === 2 && (
					<div id="step-2">
						<h3>Step 2: Tell us about yourself</h3>
						<textarea
							placeholder="Write a short bio about yourself..."
							aria-label="Bio"
							rows={3}
							maxLength={500}
							className="form-textarea"
							value={form.bio}
							onChange={(event) => setField("bio", event.target.value)}
						/>

						<div className="profile-pic-section">
							<h4>Add a Profile Picture (Optional)</h4>
							<input
								type="file"
								aria-label="Profile picture"
								accept="image/png, image/jpeg"
								className="file-input"
								onChange={(event) => setPhoto(event.target.files[0] || null)}
							/>
							<div id="profile-pic-preview">
								{photoPreview && <img src={photoPreview} alt="Profile preview" />}
							</div>
						</div>

						<div className="location-section">
							<p>📍 We need your location to help you find friends nearby</p>
							<button type="button" className="btn btn-secondary" onClick={findLocation}>
								Get My Location
							</button>
							<div id="location-status" role="status">
								{locationStatus}
							</div>
						</div>

						<StepButtons onBack={goBack} onNext={goNext} nextLabel="Next: Interests" />
					</div>
				)}

				{step === 3 && (
					<div id="step-3">
						<h3>Step 3: Select &amp; Rank Your Interests</h3>
						<p>
							Choose up to {options.maxRanked} interests and rank them in order
							of importance (1 = most important):
						</p>
						<RankedPicker
							options={options.interests}
							max={options.maxRanked}
							value={form.interests}
							onChange={(list) => setField("interests", list)}
						/>
						<StepButtons onBack={goBack} onNext={goNext} nextLabel="Next: Values" />
					</div>
				)}

				{step === 4 && (
					<div id="step-4">
						<h3>Step 4: Select &amp; Rank Your Values</h3>
						<p>
							Choose up to {options.maxRanked} values and rank them in order of
							importance (1 = most important):
						</p>
						<RankedPicker
							options={options.values}
							max={options.maxRanked}
							value={form.values}
							onChange={(list) => setField("values", list)}
						/>
						<div className="step-buttons">
							<button type="button" className="btn btn-secondary" onClick={goBack}>
								Previous
							</button>
							<button type="submit" className="btn btn-primary" disabled={submitting}>
								{submitting ? "Creating account..." : "Create Account"}
							</button>
						</div>
					</div>
				)}
			</form>
		</div>
	);
}

function StepButtons({ onBack, onNext, nextLabel }) {
	return (
		<div className="step-buttons">
			<button type="button" className="btn btn-secondary" onClick={onBack}>
				Previous
			</button>
			<button type="button" className="btn btn-primary" onClick={onNext}>
				{nextLabel}
			</button>
		</div>
	);
}
