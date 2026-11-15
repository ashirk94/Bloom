import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import PasswordInput from "../components/PasswordInput.jsx";
import { ErrorMessage } from "../components/Message.jsx";

export default function Login() {
	const { user, login } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();
	// where RequireAuth sent us from, or the profile page by default
	const destination = location.state?.from || "/profile";

	// "Controlled inputs": React state is the source of truth for what the
	// boxes contain, so there is no need to read values out of the page.
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [submitting, setSubmitting] = useState(false);

	if (user) return <Navigate to={destination} replace />;

	const handleSubmit = async (event) => {
		event.preventDefault(); // stop the browser's own full-page submit
		setError("");
		setSubmitting(true);
		try {
			await login(email, password);
			navigate(destination, { replace: true });
		} catch (err) {
			setError(err.message);
			setSubmitting(false);
		}
	};

	return (
		<div className="login-wrapper">
			<h1 className="title">Sign In</h1>
			<ErrorMessage>{error}</ErrorMessage>

			<form onSubmit={handleSubmit}>
				<input
					type="text"
					inputMode="email"
					autoComplete="email"
					placeholder="Email Address"
					aria-label="Email Address"
					value={email}
					onChange={(event) => setEmail(event.target.value)}
					required
				/>
				<PasswordInput
					label="Password"
					autoComplete="current-password"
					value={password}
					onChange={(event) => setPassword(event.target.value)}
					required
				/>
				<button type="submit" className="btn btn-primary" disabled={submitting}>
					{submitting ? "Signing in..." : "Sign In"}
				</button>
			</form>
		</div>
	);
}
