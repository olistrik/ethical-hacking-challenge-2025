import { serve } from "bun";
import index from "./index.html";
import { createSchema, createYoga } from 'graphql-yoga';
import schema from "./schema.ts";
import { ensureTeamSchema, getTeamSql } from "./db.ts";
import {
    createInlineSigningKeyProvider,
    useJWT,
    extractFromCookie,
} from '@graphql-yoga/plugin-jwt';
import { useCookies } from '@whatwg-node/server-plugin-cookies';

const signingKey = process.env.JWT_SECRET ?? "super_secret";

const yoga = createYoga({
    graphqlEndpoint: "/api/graphql",
    schema: createSchema(schema),
    logging: true,
    context: async ({ request }) => {
        const ip = request.headers.get("x-forwarded-for") ?? server.requestIP(request).address ?? "unknown";
        const team = ip.replace(/[^a-zA-Z0-9]/g, "_");

        await ensureTeamSchema(team);

        return { team };
    },

    plugins: [
        useCookies(),
        useJWT({
            signingKeyProviders: [createInlineSigningKeyProvider(signingKey)],
            tokenLookupLocations: [extractFromCookie({ name: 'auth-cookie' })],
            tokenVerification: {
                algorithms: ['HS256', 'RS256'],
            },
            extendContext: true,
            reject: {
                missingToken: false,
                invalidToken: false,
            },
        }),
    ],
})


const server = serve({
    routes: {
        // Serve index.html for all unmatched routes.
        "/*": index,
        "/api/*": yoga,
    },

    development: process.env.NODE_ENV !== "production" && {
        // Enable browser hot reloading in development
        hmr: true,

        // Echo console logs from the browser to the server
        console: true,
    },
});

console.log(`🚀 Server running at ${server.url}`);
