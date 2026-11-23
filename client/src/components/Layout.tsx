import { useEffect, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { errorMessage } from "../api";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";

// The navbar plus whichever page matches the URL (<Outlet />).
export default function Layout() {
	const { user, logout } = useAuth();
	const { unreadCount } = useChat();
	const [menuOpen, setMenuOpen] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();

	// close the mobile menu whenever the page changes
	useEffect(() => {
		setMenuOpen(false);
	}, [location.pathname]);

	const handleLogout = async () => {
		try {
			await logout();
			navigate("/");
		} catch (err) {
			// still signed in on the server, so stay on this page
			window.alert(errorMessage(err));
		}
	};

	// The original stylesheet hides and shows the mobile menu with these
	// class names. Before, a script toggled them on the elements by hand;
	// here they are simply calculated from the `menuOpen` state.
	const hiddenOnMobile = menuOpen ? "" : " mobile-invis";
	const linkClass = `nav-link nav-text${menuOpen ? " open" : ""}`;
	const itemClass = `nav-item${hiddenOnMobile}`;

	return (
		<>
			<nav className="navbar" id="navbar" aria-label="Main">
				<div className="hidden-desktop">
					<ul className="nav">
						<li className="mobile-logo">
							<Link to="/">
								<img
									className="mobile-logo"
									src="/images/bloom-flower.svg"
									alt="Bloom home"
								/>
							</Link>
						</li>
						<li className="icon">
							<button
								type="button"
								className="icon"
								aria-label="Toggle menu"
								aria-expanded={menuOpen}
								onClick={() => setMenuOpen((open) => !open)}
							>
								☰
							</button>
						</li>
					</ul>
				</div>
				<div id="inner-navbar" className={menuOpen ? "pop-in" : ""}>
					<div className={`inline-flex${hiddenOnMobile}`} id="upper-navbar">
						<ul className="nav" id="top-nav">
							<li className="nav-item navbar-logo mobile-invis">
								<Link to="/">
									<img
										className="navbar-logo mobile-invis"
										src="/images/bloom-flower.svg"
										alt="Bloom home"
									/>
								</Link>
							</li>
							{user && (
								<>
									<li className={itemClass}>
										<Link className={linkClass} to="/requests">
											Requests
										</Link>
									</li>
									<li className={itemClass}>
										<Link className={linkClass} to="/connections">
											Chat
											{unreadCount > 0 && (
												<span className="unread-badge">{unreadCount}</span>
											)}
										</Link>
									</li>
									<li className={itemClass}>
										<Link className={linkClass} to="/meet">
											Find Friends
										</Link>
									</li>
								</>
							)}
						</ul>
					</div>
					<div className={`inline-flex${hiddenOnMobile}`} id="lower-navbar">
						<ul className="nav" id="bottom-nav">
							{!user ? (
								<>
									<li className={itemClass}>
										<Link className={linkClass} to="/register">
											Sign Up
										</Link>
									</li>
									<li className={itemClass}>
										<Link className={linkClass} to="/login">
											Sign In
										</Link>
									</li>
								</>
							) : (
								<>
									<li className="nav-item navbar-logo">
										<Link to="/profile">
											<img
												className="navbar-logo profile-pic mobile-invis"
												src={user.avatarUrl}
												alt="My profile"
											/>
										</Link>
									</li>
									<li className={itemClass}>
										<Link className={linkClass} to="/profile">
											Profile
										</Link>
									</li>
									<li className={itemClass}>
										<button
											type="button"
											className={`${linkClass} nav-button`}
											onClick={handleLogout}
										>
											Sign Out
										</button>
									</li>
									{user.admin && (
										<li className={itemClass}>
											<Link className={linkClass} to="/admin">
												Admin
											</Link>
										</li>
									)}
								</>
							)}
						</ul>
					</div>
				</div>
			</nav>
			<div className="navbar-area" />
			<main>
				<Outlet />
			</main>
		</>
	);
}
