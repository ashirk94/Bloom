import { Link, useParams } from "react-router-dom";
import { useApi } from "../lib/useApi";
import type { UserProfileResponse } from "../types";
import UserCard from "../components/UserCard";
import LikeButton from "../components/LikeButton";
import Loader from "../components/Loader";
import { ErrorMessage } from "../components/Message";

// Someone else's profile. The address is /user/<id>; useParams reads the id.
// (Addresses used to contain the person's email, which exposed it to
// everyone who could see a link to them.)
export default function UserProfile() {
	const { id } = useParams();
	const { data, error, loading, reload } = useApi<UserProfileResponse>(`/users/${id}`);

	if (loading) return <Loader />;
	if (error || !data) {
		return (
			<div className="main-wrapper">
				<ErrorMessage>{error}</ErrorMessage>
			</div>
		);
	}

	const { user, relationship } = data;

	return (
		<div className="main-wrapper">
			<UserCard user={user}>
				{/* the server tells us how we relate to this person, and
				    that decides which button makes sense */}
				{relationship === "none" && (
					<LikeButton
						userId={user.id}
						className="btn btn-friend"
						label="Let's be friends!"
						doneLabel="Sent"
					/>
				)}
				{relationship === "request-sent" && (
					<button className="btn btn-friend btn-liked" disabled>
						Request sent
					</button>
				)}
				{relationship === "request-received" && (
					<LikeButton
						userId={user.id}
						className="btn btn-friend"
						label="Accept request"
						doneLabel="Accepted"
						onDone={reload}
					/>
				)}
				{relationship === "connected" && (
					<Link className="btn-card btn-primary" to={`/chat/${user.id}`}>
						Chat
					</Link>
				)}
				{relationship === "self" && (
					<Link className="btn-card btn-secondary" to="/profile">
						Edit my profile
					</Link>
				)}
			</UserCard>
		</div>
	);
}
