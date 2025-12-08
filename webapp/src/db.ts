import {sql} from "bun";

// Ensure schema exists
export async function ensureTeamSchema(team: string) {
	// copy all users to team if they don't already exist.
	await sql`
		INSERT INTO users (name, email, password, reset_token, admin, active, team)
		SELECT name, email, password, reset_token, admin, active, ${team}
		FROM users
		WHERE team = 'template'
		ON CONFLICT (email, team) DO NOTHING
	`;
}
