import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useState
} from "react";
import { api } from "../api.js";

// Context lets distant components share data without passing props through
// every level in between. This one answers "who is logged in?".
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	// true until we've asked the server whether a session already exists
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		api("/auth/me")
			.then((data) => setUser(data.user))
			.catch(() => setUser(null))
			.finally(() => setLoading(false));
	}, []);

	const login = useCallback(async (email, password) => {
		const data = await api("/auth/login", {
			method: "POST",
			body: { email, password }
		});
		setUser(data.user);
	}, []);

	const register = useCallback(async (fields) => {
		const data = await api("/auth/register", { method: "POST", body: fields });
		setUser(data.user);
	}, []);

	const logout = useCallback(async () => {
		await api("/auth/logout", { method: "POST" });
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

export function useAuth() {
	return useContext(AuthContext);
}
