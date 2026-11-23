import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState,
	type ReactNode
} from "react";
import { api } from "../api";
import type { MeResponse, OkResponse, PrivateUser, UserResponse } from "../types";

// what the sign-up form sends (see Register.tsx)
export interface RegisterFields {
	email: string;
	password: string;
	displayName: string;
	bio: string;
	interests: string[];
	values: string[];
	lat?: number;
	lon?: number;
}

// Everything the context shares. Writing it down means every component that
// calls useAuth() knows exactly what it gets back.
interface AuthValue {
	user: PrivateUser | null;
	setUser: (user: PrivateUser | null) => void;
	loading: boolean;
	login: (email: string, password: string) => Promise<void>;
	register: (fields: RegisterFields) => Promise<void>;
	logout: () => Promise<void>;
}

// Context lets distant components share data without passing props through
// every level in between. This one answers "who is logged in?".
const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<PrivateUser | null>(null);
	// true until we've asked the server whether a session already exists
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		api<MeResponse>("/auth/me")
			.then((data) => setUser(data.user))
			.catch(() => setUser(null))
			.finally(() => setLoading(false));
	}, []);

	const login = useCallback(async (email: string, password: string) => {
		const data = await api<UserResponse>("/auth/login", {
			method: "POST",
			body: { email, password }
		});
		setUser(data.user);
	}, []);

	const register = useCallback(async (fields: RegisterFields) => {
		const data = await api<UserResponse>("/auth/register", {
			method: "POST",
			body: fields
		});
		setUser(data.user);
	}, []);

	const logout = useCallback(async () => {
		await api<OkResponse>("/auth/logout", { method: "POST" });
		setUser(null);
	}, []);

	// useMemo keeps the same object between renders unless something in it
	// changed, so components using the context don't re-render needlessly
	const value = useMemo(
		() => ({ user, setUser, loading, login, register, logout }),
		[user, loading, login, register, logout]
	);

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
	const value = useContext(AuthContext);
	// The context is null only outside <AuthProvider>, which is a bug in how
	// the app is put together. Failing loudly here means components don't
	// each have to handle null.
	if (!value) throw new Error("useAuth must be used inside <AuthProvider>");
	return value;
}

// For pages behind <RequireAuth>, where someone is always logged in.
// Returns a definite user so those pages don't have to check for null.
export function useSignedInUser() {
	const { user, setUser } = useAuth();
	if (!user) throw new Error("useSignedInUser needs a page inside <RequireAuth>");
	return { user, setUser };
}
