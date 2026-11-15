import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "./Loader.jsx";

// Wraps pages that need a logged in user (or an admin).
// This only decides what to SHOW. The real protection is on the server:
// every API route checks the session itself.
export default function RequireAuth({ children, admin = false }) {
	const { user, loading } = useAuth();
	const location = useLocation();

	if (loading) return <Loader />;
	if (!user) {
		// remember where they were going so login can send them back
		return <Navigate to="/login" replace state={{ from: location.pathname }} />;
	}
	if (admin && !user.admin) {
		return (
			<div className="main-wrapper">
				<h1 className="title">Unauthorized</h1>
			</div>
		);
	}
	return children;
}
