import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode
} from "react";
import { io, type Socket } from "socket.io-client";
import { api } from "../api";
import { useAuth } from "./AuthContext";
import type {
	ClientToServerEvents,
	Conversation,
	ConversationsResponse,
	PublicMessage,
	ServerToClientEvents
} from "../types";

// The socket's events are declared in shared/types.ts, so listening for or
// sending an event that doesn't exist (or with the wrong data) is an error
export type ChatSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

interface ChatValue {
	socket: ChatSocket | null;
	conversations: Conversation[];
	unreadCount: number;
	refreshConversations: () => Promise<void>;
}

// Shares the live chat connection and the list of conversations with the
// whole app: the navbar shows the unread count, the chat page shows the rest.
const ChatContext = createContext<ChatValue | null>(null);

const FAVICON = "/images/bloom-logo.png";
const FAVICON_UNREAD = "/images/bloom-logo-notification.png";

export function ChatProvider({ children }: { children: ReactNode }) {
	const { user } = useAuth();
	const userId = user?.id;
	const [socket, setSocket] = useState<ChatSocket | null>(null);
	const [conversations, setConversations] = useState<Conversation[]>([]);

	// A ref holds a value that survives re-renders without causing one.
	// The socket listener below reads it to look up who a message is from.
	const conversationsRef = useRef(conversations);
	useEffect(() => {
		conversationsRef.current = conversations;
	}, [conversations]);

	const refreshConversations = useCallback(async () => {
		try {
			const data = await api<ConversationsResponse>("/conversations");
			setConversations(data.conversations);
		} catch {
			// not fatal: the badge just won't update this time
		}
	}, []);

	// Connect when someone logs in, disconnect when they log out.
	// The function returned from an effect is its "cleanup": React runs it
	// before the effect runs again and when the component goes away.
	useEffect(() => {
		if (!userId) {
			setConversations([]);
			return;
		}

		const connection: ChatSocket = io(); // connects to the address the page came from
		setSocket(connection);
		refreshConversations();

		connection.on("message", (message: PublicMessage) => {
			refreshConversations();

			const isIncoming = message.to === userId;
			const canNotify =
				"Notification" in window && Notification.permission === "granted";
			if (isIncoming && document.hidden && canNotify) {
				const from = conversationsRef.current.find(
					(conversation) => conversation.user.id === message.from
				);
				// Some browsers (Chrome on Android) only allow notifications
				// from a service worker and throw here. Without the try, that
				// error would stop the rest of this handler.
				try {
					new Notification(from?.user.displayName || "New message", {
						body: message.text,
						icon: FAVICON
					});
				} catch {
					// no pop-up, but the badge and title still show the message
				}
			}
		});

		return () => {
			connection.disconnect();
			setSocket(null);
		};
	}, [userId, refreshConversations]);

	const unreadCount = conversations.reduce(
		(total, conversation) => total + conversation.unreadCount,
		0
	);

	useUnreadTitle(unreadCount);

	const value = useMemo(
		() => ({ socket, conversations, unreadCount, refreshConversations }),
		[socket, conversations, unreadCount, refreshConversations]
	);

	return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatValue {
	const value = useContext(ChatContext);
	if (!value) throw new Error("useChat must be used inside <ChatProvider>");
	return value;
}

// While there are unread messages, show the "notification" favicon, and
// flash the tab title if the tab is in the background.
function useUnreadTitle(unreadCount: number) {
	useEffect(() => {
		// getElementById returns a general HTMLElement; we know it's a <link>
		const favicon = document.getElementById("favicon") as HTMLLinkElement | null;
		const originalTitle = "Bloom";
		if (favicon) favicon.href = unreadCount > 0 ? FAVICON_UNREAD : FAVICON;
		if (unreadCount === 0) return;

		const interval = setInterval(() => {
			if (!document.hidden) {
				document.title = originalTitle;
				return;
			}
			document.title =
				document.title === originalTitle
					? `New message | ${originalTitle}`
					: originalTitle;
		}, 1000);

		return () => {
			clearInterval(interval);
			document.title = originalTitle;
		};
	}, [unreadCount]);
}
