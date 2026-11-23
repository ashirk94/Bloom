import bcrypt from "bcrypt";

// hash password with bcrypt
export async function genPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 10);
}

export async function validPassword(password: string, hash: string): Promise<boolean> {
	return bcrypt.compare(password, hash);
}
