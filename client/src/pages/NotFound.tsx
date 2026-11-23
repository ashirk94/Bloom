import { Link } from "react-router-dom";

export default function NotFound() {
	return (
		<div className="main-wrapper">
			<h1 className="title">Page not found</h1>
			<Link to="/" className="btn btn-primary">
				Back to the home page
			</Link>
		</div>
	);
}
