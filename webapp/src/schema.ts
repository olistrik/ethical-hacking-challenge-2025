import { sql, randomUUIDv7 } from "bun";
import jwt from 'jsonwebtoken';
import { GraphQLError } from 'graphql';

const JWT_SECRET = process.env.JWT_SECRET ?? "super_secret";

export default {
    typeDefs: `
		type Query {
			me: User!
			myNotes: [Note!]!
			users: [User!]!
		}

		type Mutation {
			login(email: String!, password: String!): Boolean!
			requestPasswordReset(email: String!): Boolean!
			resetPassword(token: String!, password: String!): Boolean!
		}

		type User {
			name: String!
			email: String!
			password: String!
			reset_token: String
			admin: Boolean!
			active: Boolean!
		}

		type Note {
			name: String!
			body: String!
		}
	`,
    resolvers: {
        Query: {
            me: async (_, __, ctx) => {
                if (!ctx.jwt) throw new GraphQLError("Not logged in!");
                const [user] = await sql`
					SELECT * FROM users WHERE email = ${ctx.jwt.payload.email} AND team = ${ctx.team}
				`;
                return user;
            },
            myNotes: async (_, __, ctx) => {
                if (!ctx.jwt) throw new GraphQLError("Not logged in!");
                const notes = await sql`
					SELECT * FROM notes WHERE email = ${ctx.jwt.payload.email}
				`;
                return notes;
            },
            users: (_, __, { team }) => sql`
				SELECT * FROM users
				WHERE team = ${team}
			`,
        },
        Mutation: {
            login: async (_, args, ctx) => {
                const users = await sql`
				SELECT * FROM users
				WHERE 
					email = ${args.email} 
					AND team = ${ctx.team} 
					AND ("password" = crypt(${args.password}, "password"))
				`;

                console.log("Users:", users);
                if (users.length !== 1)
                    throw new GraphQLError("Your email or password is incorrect!");
                const [user] = users;

                if (!user.active)
                    throw new GraphQLError("Your account is not active, ask an admin to reactivate you!");

                const payload = {
                    sub: user.id,
                    name: user.name,
                    email: user.email,
                    admin: user.admin,
                };

                const token = jwt.sign(payload, JWT_SECRET, {
                    expiresIn: '10h',
                });

                console.log(token);

                await ctx.request.cookieStore?.set("auth-cookie", token);
                return true;
            },
            requestPasswordReset: async (_, args, { team }) => {
                const resetToken = randomUUIDv7();
                await sql`
					UPDATE users
					SET reset_token = ${resetToken} 
					WHERE email = ${args.email} AND team = ${team}
				`;
                return true;
            },
            resetPassword: async (_, args, { team }) => {
                await sql`
				UPDATE users SET 
					password = crypt(${args.password}, gen_salt('bf')),
					reset_token = NULL
				WHERE
					reset_token = ${args.token} AND team = ${team}
				`;
                return true;
            },
        },
    },
}
