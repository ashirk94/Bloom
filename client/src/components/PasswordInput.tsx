import { useState, type InputHTMLAttributes } from "react";

// every prop a normal <input> accepts (value, onChange, required...), plus
// our own `label`
interface PasswordInputProps extends InputHTMLAttributes<HTMLInputElement> {
	label: string;
}

// A password box with a show/hide toggle. Used on the login and sign-up
// pages (the old code had a copy of this logic in each page's script).
export default function PasswordInput({ label, ...inputProps }: PasswordInputProps) {
	const [visible, setVisible] = useState(false);
	const toggle = () => setVisible((current) => !current);

	return (
		<div className="password-field">
			<img
				src={
					visible
						? "/images/eye-regular.png"
						: "/images/eye-slash-regular.png"
				}
				className="eye"
				alt={visible ? "Hide password" : "Show password"}
				role="button"
				tabIndex={0}
				onClick={toggle}
				onKeyDown={(event) => {
					if (event.key === "Enter" || event.key === " ") {
						event.preventDefault();
						toggle();
					}
				}}
			/>
			<input
				type={visible ? "text" : "password"}
				aria-label={label}
				placeholder={label}
				{...inputProps}
			/>
		</div>
	);
}
