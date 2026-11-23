import { useApi } from "../lib/useApi";
import type { UsersResponse } from "../types";
import UserCard from "../components/UserCard";
import LikeButton from "../components/LikeButton";
import Loader from "../components/Loader";
import { ErrorMessage } from "../components/Message";

// People who asked to be friends and are waiting for an answer.
// Accepting is the same action as sending a request: a "like" back.
export default function Requests() {
	const { data, error, loading } = useApi<UsersResponse>("/requests");

	if (loading) return <Loader />;

	return (
		<div className="main-wrapper">
			<h1 className="title">Friend Requests</h1>
			<ErrorMessage>{error}</ErrorMessage>
			{data?.users.length === 0 && (
				<h2 className="subtitle">No new requests right now.</h2>
			)}
			<div className="friends-container">
				{data?.users.map((user) => (
					<UserCard key={user.id} user={user}>
						<LikeButton userId={user.id} label="Accept" doneLabel="Accepted" />
					</UserCard>
				))}
			</div>
		</div>
	);
}
