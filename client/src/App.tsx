import type { ReactNode } from "react";
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import RequireAuth from "./components/RequireAuth";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import EditRanked from "./pages/EditRanked";
import EditBio from "./pages/EditBio";
import Meet from "./pages/Meet";
import Requests from "./pages/Requests";
import Connections from "./pages/Connections";
import UserProfile from "./pages/UserProfile";
import Chat from "./pages/Chat";
import Admin from "./pages/Admin";
import { About, PrivacyPolicy, TermsOfService } from "./pages/Info";
import NotFound from "./pages/NotFound";

// A small helper so the list below stays readable
const secure = (page: ReactNode) => <RequireAuth>{page}</RequireAuth>;

// The URL decides which page component is shown. Navigation happens in the
// browser without reloading the page; the server only supplies data.
export default function App() {
	return (
		<Routes>
			{/* sign-up has its own full-page design without the navbar */}
			<Route path="/register" element={<Register />} />

			<Route element={<Layout />}>
				<Route path="/" element={<Landing />} />
				<Route path="/login" element={<Login />} />
				<Route path="/about" element={<About />} />
				<Route path="/privacy-policy" element={<PrivacyPolicy />} />
				<Route path="/terms-of-service" element={<TermsOfService />} />

				<Route path="/profile" element={secure(<Profile />)} />
				<Route
					path="/interests"
					element={secure(<EditRanked kind="interests" key="interests" />)}
				/>
				<Route
					path="/values"
					element={secure(<EditRanked kind="values" key="values" />)}
				/>
				<Route path="/bio" element={secure(<EditBio />)} />
				<Route path="/meet" element={secure(<Meet />)} />
				<Route path="/requests" element={secure(<Requests />)} />
				<Route path="/connections" element={secure(<Connections />)} />
				<Route path="/user/:id" element={secure(<UserProfile />)} />
				<Route path="/chat/:id" element={secure(<Chat />)} />
				<Route
					path="/admin"
					element={
						<RequireAuth admin>
							<Admin />
						</RequireAuth>
					}
				/>

				<Route path="*" element={<NotFound />} />
			</Route>
		</Routes>
	);
}
