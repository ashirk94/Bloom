import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In development there are two servers:
//   - Vite (port 5173) serves the React app and reloads it as you edit
//   - Express (port 3000) is the API
// The proxy forwards API and chat traffic from Vite to Express, so the
// browser only ever talks to one address and cookies "just work".
export default defineConfig({
	plugins: [react()],
	server: {
		port: 5173,
		proxy: {
			"/api": "http://localhost:3000",
			"/socket.io": { target: "http://localhost:3000", ws: true }
		}
	}
});
