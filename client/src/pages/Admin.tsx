import { useState } from "react";
import { api, errorMessage } from "../api";
import { useSignedInUser } from "../context/AuthContext";
import type { AdminUser, AdminUsersResponse, OkResponse } from "../types";
import { useApi } from "../lib/useApi";
import UserCard from "../components/UserCard";
import Loader from "../components/Loader";
import { ErrorMessage } from "../components/Message";

export default function Admin() {
	const { user: me } = useSignedInUser();
	const { data, error, loading, reload } = useApi<AdminUsersResponse>("/admin/users");
	const [deleteError, setDeleteError] = useState("");

	if (loading) return <Loader />;

	const deleteUser = async (user: AdminUser) => {
		// deleting can't be undone, so ask first
		const sure = window.confirm(
			`Delete ${user.displayName} (${user.email}) and all of their messages?`
		);
		if (!sure) return;

		setDeleteError("");
		try {
			await api<OkResponse>(`/admin/users/${user.id}`, { method: "DELETE" });
			await reload();
		} catch (err) {
			setDeleteError(errorMessage(err));
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
