import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import type { PublicUser } from "../types";

interface UserCardProps {
	user: PublicUser;
	extra?: ReactNode;
	children?: ReactNode;
}

// One person's card. Every list page (Find Friends, Requests, Connections,
// Admin) used to repeat this same block of HTML; now they all render
// <UserCard>. Whatever is placed inside the tag (`children`) becomes the
// card's buttons, and `extra` is an optional line under the name.
export default function UserCard({ user, extra, children }: UserCardProps) {
	return (
		<div className="friend-box">
			<div className="box-top">
				<Link to={`/user/${user.id}`}>
					<img
						className="list-pic"
						src={user.avatarUrl}
						alt={`${user.displayName}'s profile picture`}
					/>
				</Link>
			</div>
			<div className="profile-name">{user.displayName}</div>
			{extra}
			<div className="bio">{user.bio || <br />}</div>

			<RankedLine label="Interests" items={user.interests} />
			<RankedLine label="Values" items={user.values} />

			{children && <div className="btn-card-group">{children}</div>}
		</div>
	);
}

function RankedLine({ label, items }: { label: string; items: string[] }) {
	return (
		<p className="ranked-line">
			<span className="profile-info">
				<strong>{label}:</strong>{" "}
				{items.length > 0 ? items.join(", ") : "None yet"}
			</span>
		</p>
	);
}
