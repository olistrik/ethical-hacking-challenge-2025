CREATE EXTENSION pgcrypto;

CREATE TABLE users (
	id SERIAL PRIMARY KEY,
	team VARCHAR(50) NOT NULL,
	name VARCHAR(50),
	email VARCHAR(100) NOT NULL,
	password VARCHAR(100),
	reset_token VARCHAR(100),
	admin BOOLEAN DEFAULT FALSE,
	active BOOLEAN DEFAULT TRUE,
	UNIQUE(email, team)
);

INSERT INTO users (team, name, email, password, admin, active) VALUES 
	('template','alice', 'alice@example.com', crypt('correcthorsebatterystaple', gen_salt('bf')), true, true),
	('template', 'bob', 'bob@example.com', crypt('WgL#Kos!SZiT0cWKJ%Kk3@*7LwXEi$x%xojkOl$0z5@LO', gen_salt('bf')), false, true),
	('template', 'flag', 'flag@example.com', crypt('x4jwCZTe%XHiM2CppYK7i7%FQu7l5Pjwb%TeQAR!Pe4sX', gen_salt('bf')), false, true)
ON CONFLICT (email, team) DO NOTHING;

CREATE TABLE notes (
	id SERIAL PRIMARY KEY,
	email VARCHAR(100) NOT NULL,
	name VARCHAR(50) NOT NULL,
	body VARCHAR(512) NOT NULL,
	UNIQUE(email, name)
);

INSERT INTO notes (email, name, body) VALUES
	('flag@example.com', 'Congratulations!', 'EH2025{5618fc91f4bea53c1203f3cea4fb69e526cc5ae566550cd754707c297fc93779}'),
	('alice@example.com', 'Important!', 'Remember to add the admin auth to the users endpoint. Right now, anyone can use it!'),
	('bob@example.com', 'We''re no strangers to love', 'Never gonna give you up, never gonna let you down, never gonna turn around and desert you.')
ON CONFLICT (email, name) DO NOTHING;

