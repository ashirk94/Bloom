// Success and error banners. `role` makes screen readers announce them.
export function ErrorMessage({ children }) {
	if (!children) return null;
	return (
		<div className="error-msg" role="alert">
			❌ {children}
		</div>
	);
}

export function SuccessMessage({ children }) {
	if (!children) return null;
	return (
		<div className="success-msg" role="status">
			✅ {children}
		</div>
	);
}
