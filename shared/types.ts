// The shapes of the data the server sends to the React app.
//
// Both sides import this file: the server's serializers (utilities/
// serialize.ts) promise to RETURN these shapes, and the React pages EXPECT
// them. If someone renames a field on one side, TypeScript reports an error
// on the other side instead of the page silently showing "undefined".
//
// Only types live here. Types are erased when the code is compiled, so this
// file adds nothing to the server or to the JavaScript the browser downloads.

// ---------- users ----------

// what any logged in user may see about another user
export interface PublicUser {
	id: string;
	displayName: string;
	bio: string;
	interests: string[];
	values: string[];
	avatarUrl: string;
}

// what a user may see about their own account
export interface PrivateUser extends PublicUser {
	email: string;
	admin: boolean;
	hasLocation: boolean;
}

// how another user relates to me (decides which button a profile shows)
export type Relationship =
	| "self"
	| "connected"
	| "request-sent"
	| "request-received"
	| "none";

// ---------- options ----------

export interface Option {
	name: string;
	emoji: string;
}

// "interests" | "values": the two ranked lists a user fills in
export type RankedKind = "interests" | "values";

// ---------- messages ----------

export interface PublicMessage {
	id: string;
	from: string;
	to: string;
	text: string;
	// sent over the network as JSON, which turns Dates into ISO strings
	createdAt: string;
}

export interface Conversation {
	user: PublicUser;
	lastMessage: PublicMessage | null;
	unreadCount: number;
}

export interface Match {
	user: PublicUser;
	compatibility: number;
	sharedInterests: string[];
	sharedValues: string[];
	distanceKm: number | null;
}

// ---------- API responses, one per route ----------

export interface UserResponse {
	user: PrivateUser;
}
export interface MeResponse {
	user: PrivateUser | null;
}
export interface OkResponse {
	ok: true;
}
export interface OptionsResponse {
	maxRanked: number;
	interests: Option[];
	values: Option[];
}
export interface UsersResponse {
	users: PublicUser[];
}
export interface AdminUser extends PublicUser {
	email: string;
	admin: boolean;
}
export interface AdminUsersResponse {
	users: AdminUser[];
}
export interface MatchesResponse {
	needsLocation: boolean;
	matches: Match[];
}
export interface UserProfileResponse {
	user: PublicUser;
	relationship: Relationship;
}
export interface LikeResponse {
	connected: boolean;
}
export interface ConversationsResponse {
	conversations: Conversation[];
}
export interface MessagesResponse {
	friend: PublicUser;
	messages: PublicMessage[];
}
export interface ErrorResponse {
	error: string;
}

// ---------- live chat (socket.io) ----------
// socket.io lets both sides declare which events exist and what each one
// carries, so `socket.emit("send-mesage", ...)` (typo) is a compile error.

export interface SendMessagePayload {
	to: string;
	text: string;
}

export type SendMessageResult = { ok: true } | { ok: false; error: string };

// events the server sends to browsers
export interface ServerToClientEvents {
	message: (message: PublicMessage) => void;
}

// events browsers send to the server
export interface ClientToServerEvents {
	"send-message": (
		payload: SendMessagePayload,
		reply: (result: SendMessageResult) => void
	) => void;
}
