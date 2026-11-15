import { useState } from "react";
import { api } from "../api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useApi } from "../lib/useApi.js";
import UserCard from "../components/UserCard.jsx";
import Loader from "../components/Loader.jsx";
import { ErrorMessage } from "../components/Message.jsx";

export default function Admin() {
	const { user: me } = useAuth();
	const { data, error, loading, reload } = useApi("/admin/users");
	const [deleteError, setDeleteError] = useState("");

	if (loading) return <Loader />;

	const deleteUser = async (user) => {
		// deleting can't be undone, so ask first
		const sure = window.confirm(
			`Delete ${user.displayName} (${user.email}) and all of their messages?`
		);
		if (!sure) return;

		setDeleteError("");
		try {
			await api(`/admin/users/${user.id}`, { method: "DELETE" });
			await reload();
		} catch (err) {
			setDeleteError(err.message);
		}
	};

	return (
		<div className="main-wrapper">
			<h1 className="title">Manage Users</h1>
			<ErrorMessage>{error || deleteError}</ErrorMessage>
			<div className="friends-container">
				{data?.users.map((user) => (
					<UserCard
						key={user.id}
						user={user}
						extra={<div className="match-summary">{user.email}</div>}
					>
						{user.id === me.id ? (
							<span className="profile-info">This is you</span>
						) : (
							<button className="btn-delete" onClick={() => deleteUser(user)}>
								Delete
							</button>
						)}
					</UserCard>
				))}
			</div>
		</div>
	);
}
