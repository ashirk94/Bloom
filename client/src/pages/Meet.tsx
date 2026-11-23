import { Link } from "react-router-dom";
import { useApi } from "../lib/useApi";
import type { Match, MatchesResponse } from "../types";
import UserCard from "../components/UserCard";
import LikeButton from "../components/LikeButton";
import Loader from "../components/Loader";
import { ErrorMessage } from "../components/Message";

// "Find Friends": the people the matching algorithm suggests, best first.
export default function Meet() {
	const { data, error, loading } = useApi<MatchesResponse>("/matches");

	if (loading) return <Loader />;

	return (
		<div className="main-wrapper">
			<h1 className="title">Potential Friends</h1>
			<ErrorMessage>{error}</ErrorMessage>

			{data?.needsLocation && (
				<h2 className="subtitle">
					We need your location to find people near you. You can share it on
					your <Link to="/profile" className="default-text-color">profile page</Link>.
				</h2>
			)}
			{data && !data.needsLocation && data.matches.length === 0 && (
				<h2 className="subtitle">
					There are currently no more users in the area.
				</h2>
			)}

			<div className="friends-container">
				{data?.matches.map((match) => (
					<UserCard
						key={match.user.id}
						user={match.user}
						extra={<MatchSummary match={match} />}
					>
						<LikeButton
							userId={match.user.id}
							label="Let's be friends!"
							doneLabel="Sent"
						/>
					</UserCard>
				))}
			</div>
		</div>
	);
}

// Explains WHY someone was suggested, instead of only showing them
function MatchSummary({ match }: { match: Match }) {
	const shared = [...match.sharedInterests, ...match.sharedValues];
	return (
		<div className="match-summary">
			<span className="match-badge">{match.compatibility}% match</span>
			{match.distanceKm !== null && (
				<span className="match-distance">within {match.distanceKm} km</span>
			)}
			{shared.length > 0 && (
				<div className="match-shared">You both chose: {shared.join(", ")}</div>
			)}
		</div>
	);
}
