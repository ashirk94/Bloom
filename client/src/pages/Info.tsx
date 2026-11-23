import type { ReactNode } from "react";

// The three plain text pages. They have no state or data loading, so they
// are simple components that return markup, kept together in one file.

const FEATURES = [
	[
		"Matching algorithm designed to connect people based on their ranked interests and values.",
		"Authentication implemented with the Passport and Bcrypt libraries.",
		"Location and distance measuring to pair users based on proximity."
	],
	[
		"Frontend built with React, React Router and Vite.",
		"Responsive animated navbar.",
		"Profile picture uploading with a preview display.",
		"User data storage with MongoDB and Mongoose.",
		"Admin area for data management."
	],
	[
		"Instant messaging between users made with the socket.io library.",
		"Notifications on new messages.",
		"Title flashing and favicon changing to notify inactive users of messages.",
		"Message times convert to local time.",
		"A sidebar to switch between chatrooms."
	],
	[
		"Was deployed to a Heroku Dyno utilizing continuous integration.",
		"Privacy Policy and Terms of Service.",
		"Logo and designs made by Sarah Martin."
	]
];

export function About() {
	return (
		<div className="info-wrapper">
			<h1 className="title">About</h1>
			<p>
				Bloom is a unique social platform that helps foster friendships through
				shared interests and values.
			</p>
			<p>
				Made in collaboration with Artist and UI/UX designer{" "}
				<a
					href="https://www.sarahmartinart.com/"
					target="_blank"
					rel="noreferrer"
					className="default-text-color"
				>
					Sarah Martin
				</a>
				.
			</p>

			<h2 className="subtitle">Features</h2>
			{FEATURES.map((group, index) => (
				<ul className="about-list" key={index}>
					{group.map((feature) => (
						<li className="list-dot" key={feature}>
							{feature}
						</li>
					))}
				</ul>
			))}
		</div>
	);
}

function Section({ title, children }: { title: string; children: ReactNode }) {
	return (
		<section className="info-section">
			<h2 className="info-heading">{title}</h2>
			{children}
		</section>
	);
}

export function PrivacyPolicy() {
	return (
		<div className="info-wrapper">
			<h1>Privacy Policy</h1>
			<div>Effective Date: 7/27/2025</div>

			<Section title="1. Introduction">
				<p>
					This Privacy Policy outlines how Bloom ("we," "us," or "our")
					collects, uses, shares, and protects the personal information of
					users ("you" or "users") who access and use our website ("the
					Website").
				</p>
			</Section>
			<Section title="2. Information We Collect">
				<p>
					2.1. Personal Information: We may collect personal information that
					you voluntarily provide to us when using our website. This
					information may include but is not limited to your name, email
					address, phone number, and any other information you choose to
					provide.
				</p>
				<p>
					2.2. Non-Personal Information: We may also collect non-personal
					information, such as your IP address, browser type, operating system,
					and other technical details when you interact with our website.
				</p>
			</Section>
			<Section title="3. How We Use Your Information">
				<p>We may use the information we collect for the following purposes:</p>
				<p>
					To provide and improve our services. To respond to your inquiries and
					requests. To send you updates, newsletters, or promotional materials.
					To analyze and monitor usage patterns and trends.
				</p>
			</Section>
			<Section title="4. Information Sharing">
				<p>
					We do not sell, rent, or trade your personal information to third
					parties. However, we may share your information with:
				</p>
				<p>
					Service providers who help us operate and maintain the website. Legal
					authorities or government agencies when required by law.
				</p>
			</Section>
			<Section title="5. Your Choices">
				<p>You have the right to:</p>
				<p>
					Access, correct, or delete your personal information. Opt-out of
					receiving marketing communications from us.
				</p>
			</Section>
			<Section title="6. Security">
				<p>
					We take reasonable measures to protect your information, but no
					method of data transmission or storage is entirely secure. We cannot
					guarantee the security of your information.
				</p>
			</Section>
			<Section title="7. Changes to This Privacy Policy">
				<p>
					We reserve the right to update this Privacy Policy at any time. We
					will notify you of any changes by posting the updated Privacy Policy
					on our website.
				</p>
			</Section>
		</div>
	);
}

export function TermsOfService() {
	return (
		<div className="info-wrapper">
			<h1>Terms of Service</h1>
			<div>Effective Date: 9/4/2023</div>

			<Section title="1. Acceptance of Terms">
				<p>
					By accessing and using the Bloom website, you agree to comply with
					and be bound by these Terms of Service.
				</p>
			</Section>
			<Section title="2. Use of the Website">
				<p>
					You agree to use the website only for lawful purposes and in a way
					that does not violate the rights of others or inhibit their use and
					enjoyment of the website.
				</p>
			</Section>
			<Section title="3. User Content">
				<p>
					You may be able to post content on the website. By doing so, you
					grant us a non-exclusive, worldwide, royalty-free license to use,
					reproduce, modify, and display your content.
				</p>
			</Section>
			<Section title="4. Intellectual Property">
				<p>
					All content on the website, including but not limited to text,
					graphics, logos, and software, is protected by copyright and other
					intellectual property laws. You may not use, reproduce, or distribute
					our content without our permission.
				</p>
			</Section>
			<Section title="5. Limitation of Liability">
				<p>
					We are not liable for any damages or losses resulting from your use
					of the website. You use the website at your own risk.
				</p>
			</Section>
			<Section title="6. Changes to Terms">
				<p>
					We may update these Terms of Service at any time, and your continued
					use of the website after such changes constitutes your acceptance of
					the new terms.
				</p>
			</Section>
		</div>
	);
}
