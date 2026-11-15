import { Link } from "react-router-dom";
import { useApi } from "../lib/useApi.js";
import { useChat } from "../context/ChatContext.jsx";
import UserCard from "../components/UserCard.jsx";
import Loader from "../components/Loader.jsx";
import { ErrorMessage } from "../components/Message.jsx";

// Everyone I'm connected with, each with a button to open the chat.
export default function Connections() {
	const { data, error, loading } = useApi("/connections");
	const { conversations } = useChat();

	if (loading) return <Loader />;

	const unreadFrom = (userId) =>
		conversations.find((c) => c.user.id === userId)?.unreadCount || 0;

	return (
		<div className="main-wrapper">
			<h1 className="title">My Friends</h1>
			<ErrorMessage>{error}</ErrorMessage>
			{data?.users.length === 0 && (
				<h2 className="subtitle">
					No connections yet.{" "}
					<Link to="/meet" className="default-text-color">
						Find some friends!
					</Link>
				</h2>
			)}
			<div className="friends-container">
				{data?.users.map((user) => (
					<UserCard key={user.id} user={user}>
						<Link className="btn-card btn-primary" to={`/chat/${user.id}`}>
							Chat
							{unreadFrom(user.id) > 0 && (
								<span className="unread-badge">{unreadFrom(user.id)}</span>
							)}
						</Link>
					</UserCard>
				))}
			</div>
		</div>
	);
}
