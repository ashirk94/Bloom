import { useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { api, errorMessage } from "../api";
import { useSignedInUser } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { formatTime } from "../lib/format";
import Loader from "../components/Loader";
import { ErrorMessage } from "../components/Message";
import type { MessagesResponse, PublicMessage, PublicUser } from "../types";

const MAX_LENGTH = 2000;

export default function Chat() {
	// The route is /chat/:id, so the id is always there. useParams can't know
	// which route it is used in, so it says "string or undefined"; `?? ""`
	// turns the impossible undefined into an id that matches nobody.
	const friendId = useParams().id ?? "";
	const { user } = useSignedInUser();
	const { socket, conversations, refreshConversations } = useChat();

	const [friend, setFriend] = useState<PublicUser | null>(null);
	const [messages, setMessages] = useState<PublicMessage[]>([]);
	const [draft, setDraft] = useState("");
	const [loadError, setLoadError] = useState("");
	const [sendError, setSendError] = useState("");
	const [canAskToNotify, setCanAskToNotify] = useState(
		"Notification" in window && Notification.permission === "default"
	);
	const bottomRef = useRef<HTMLDivElement>(null);

	// The sidebar list is loaded at login, so someone who became a friend
	// since then (e.g. a request accepted a minute ago) would be missing
	useEffect(() => {
		refreshConversations();
	}, [refreshConversations]);

	// Load the conversation whenever the friend in the URL changes
	useEffect(() => {
		let ignore = false;
		setFriend(null);
		setMessages([]);
		setLoadError("");

		api<MessagesResponse>(`/conversations/${friendId}/messages`)
			.then((data) => {
				if (ignore) return;
				setFriend(data.friend);
				setMessages(data.messages);
			})
			.catch((err: unknown) => {
				if (!ignore) setLoadError(errorMessage(err));
			});

		return () => {
			ignore = true;
		};
	}, [friendId]);

	// Listen for live messages while this chat is open
	useEffect(() => {
		if (!socket) return;

		const handleMessage = (message: PublicMessage) => {
			// the socket delivers ALL my messages; keep this conversation's
			const inThisChat =
				(message.from === friendId && message.to === user.id) ||
				(message.from === user.id && message.to === friendId);
			if (!inThisChat) return;

			// never change state in place: build a new array so React
			// notices the change. (Skip it if we already have this message.)
			setMessages((current) =>
				current.some((m) => m.id === message.id) ? current : [...current, message]
			);
		};

		socket.on("message", handleMessage);
		return () => {
			socket.off("message", handleMessage);
		};
	}, [socket, friendId, user.id]);

	// Reading a conversation marks it as read - but only while the tab is
	// actually being looked at
	const lastMessageId = messages[messages.length - 1]?.id;
	useEffect(() => {
		if (!friend) return;

		const markRead = () => {
			if (document.hidden) return;
			api(`/conversations/${friendId}/read`, { method: "POST" })
				.then(refreshConversations)
				.catch(() => {});
		};

		markRead();
		document.addEventListener("visibilitychange", markRead);
		return () => document.removeEventListener("visibilitychange", markRead);
	}, [friend, friendId, lastMessageId, refreshConversations]);

	// keep the newest message in view
	useEffect(() => {
		bottomRef.current?.scrollIntoView({ block: "end" });
	}, [lastMessageId]);

	const handleSubmit = (event: FormEvent) => {
		event.preventDefault();
		const text = draft.trim();
		if (!text || !socket) return;

		setSendError("");
		// The callback is called by the server to say how it went. If the
		// connection is down the server never answers, so give up after 10
		// seconds instead of silently losing the message.
		socket.timeout(10000).emit("send-message", { to: friendId, text }, (err, result) => {
			// result is { ok: true } or { ok: false, error }, and checking `ok`
			// tells TypeScript which one it is, so `error` can be read safely
			if (err || !result.ok) {
				const reason = !err && !result.ok ? result.error : null;
				setSendError(reason || "Message could not be sent. Check your connection.");
				// give the text back so it isn't lost, unless they've already
				// started typing something new
				setDraft((current) => current || text);
			}
		});
		setDraft("");
	};

	const askToNotify = async () => {
		await Notification.requestPermission();
		setCanAskToNotify(false);
	};

	if (loadError) {
		return (
			<div className="main-wrapper">
				<ErrorMessage>{loadError}</ErrorMessage>
				<Link to="/connections" className="btn btn-primary">
					Back to my friends
				</Link>
			</div>
		);
	}
	if (!friend) return <Loader />;

	return (
		<div className="chat-wrapper">
			<aside className="left-side" aria-label="Conversations">
				<div className="open-chats">
					<div className="open-chats-text">Friends</div>
				</div>
				{conversations.map(({ user: other, unreadCount }) => (
					<Link
						key={other.id}
						to={`/chat/${other.id}`}
						className={`chat-header chat-link${other.id === friendId ? " active" : ""}`}
					>
						<img className="user-img" src={other.avatarUrl} alt="" />
						<span className="chat-username">{other.displayName}</span>
						{unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
					</Link>
				))}
			</aside>

			<section className="right-side">
				<div className="chat-right-top">
					<div className="chat-right-top-inner">
						<img className="user-img" src={friend.avatarUrl} alt="" />
						<Link to={`/user/${friend.id}`} className="chat-link default-text-color">
							{friend.displayName}
						</Link>
						{canAskToNotify && (
							<button type="button" className="notify-button" onClick={askToNotify}>
								🔔 Notify me about new messages
							</button>
						)}
					</div>
				</div>

				<div className="chat-area">
					{/* aria-live makes screen readers announce new messages */}
					<div id="message-container" aria-live="polite">
						{messages.length === 0 && (
							<p className="chat-empty">
								No messages yet. Say hello to {friend.displayName}!
							</p>
						)}
						{messages.map((message) => {
							const isMine = message.from === user.id;
							return (
								<div key={message.id} className="chat-message">
									<div className="chat-heading">
										<div className="chat-time">{formatTime(message.createdAt)}</div>
										{isMine ? "You" : friend.displayName}
									</div>
									{/* React escapes text for us, so a message
									    containing HTML is shown as plain text */}
									<div className={isMine ? "message" : "message-other"}>
										{message.text}
									</div>
								</div>
							);
						})}
						<div ref={bottomRef} />
					</div>
				</div>

				<div className="chat-input-area">
					<form id="chat-form" autoComplete="off" onSubmit={handleSubmit}>
						<ErrorMessage>{sendError}</ErrorMessage>
						<div className="message-group">
							<input
								type="text"
								id="message-input"
								aria-label="Message"
								placeholder="Type something here..."
								maxLength={MAX_LENGTH}
								value={draft}
								onChange={(event) => setDraft(event.target.value)}
							/>
							<button type="submit" className="btn-primary send-btn" id="send-button">
								Send
							</button>
						</div>
					</form>
				</div>
			</section>
		</div>
	);
}
