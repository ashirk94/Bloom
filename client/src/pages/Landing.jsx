import { Link } from "react-router-dom";

export default function Landing() {
	return (
		<div className="landing-wrapper">
			{/* <picture> lets the browser choose the artwork that fits the
			    window. A script used to do this by reading the size of the
			    whole screen, so resizing the window never changed anything. */}
			<picture>
				<source media="(max-width: 414px)" srcSet="/images/mobile-breakpoint.jpg" />
				<source media="(max-width: 833px)" srcSet="/images/medium-breakpoint.jpg" />
				<img
					src="/images/landing-page.jpg"
					alt="Bloom: find friends through shared interests and values"
					className="background"
				/>
			</picture>
			<div className="landing-content">
				<div className="btn-group">
					<Link to="/register" className="btn btn-primary">
						YES, SIGN ME UP!
					</Link>
				</div>
				<div className="landing-more">
					<Link to="/about">I want to learn more.</Link>
				</div>
				<div className="copyright">
					<Link to="/privacy-policy">Privacy Policy</Link>
					<p>&nbsp;&nbsp;|&nbsp;&nbsp;</p>
					<Link to="/terms-of-service">Terms of Service</Link>
					<p>&nbsp;&nbsp;|&nbsp;&nbsp;</p>
					<p>Copyright &copy; 2023-{new Date().getFullYear()} Bloom App</p>
				</div>
			</div>
		</div>
	);
}
