import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ChatProvider } from "./context/ChatContext";

// the original stylesheets, unchanged, so the design stays the same
import "./styles/styles.css";
import "./styles/friends.css";
import "./styles/design.css";
import "./styles/fineTuning.css";
import "./styles/profile.css";
// small additions made for the React version
import "./styles/app.css";

// Providers wrap the app so any component inside can ask "who is logged in?"
// (AuthProvider) or "do I have unread messages?" (ChatProvider).
// The `!` tells TypeScript "this is definitely not null": index.html always
// has a <div id="root">
createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<BrowserRouter>
			<AuthProvider>
				<ChatProvider>
					<App />
				</ChatProvider>
			</AuthProvider>
		</BrowserRouter>
	</StrictMode>
);
