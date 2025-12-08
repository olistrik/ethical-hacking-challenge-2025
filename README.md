# Description

This challenge is based on a real issue that I (Oli) had at work, and is quite
a common misconfiguration with GraphQL. The crux of the issue can really be divided
into two main learning points:

## Private APIs should never disclose more information than absolutely necessary.
   
In the case of GraphQL, it often comes with Introspection, generated online
documentation, and in many cases an in-browser live editor that can be used to
interactively create and execute queries against the server. This isn't only
limited to GraphQL, most major API documentation tools such as OpenAPI and
SwaggerDocs also have interactive queries.

For developers, these kinds of tools are very helpful. Especially in the case
of GraphQL as many libraries and frameworks built around it automatically
generate clients from the Introspection routes. It can also be a very useful tool
for hackers however as it'll likely expose every single capability of your API.

## Dynamic API request builders like GraphQL can do much more than you expect.

GraphQL allows clients to effectively define their own API, only requesting the
information that they require. When done "properly" this usually means that the
GraphQL API becomes a thin layer between a client and the database. There are even
libraries that allow you to generate your GraphQL server _from_ your database
schema, and these often create very "smart" APIs which allow the client to
construct joins across relations in the database.

The problem is, exactly which layer of your application these joins get
applied can be very difficult to determine. In the actual exploit from my work
we were applying authentication and field masking on the top level GraphQL
queries and mutations. This worked fine with the way we used the API, but
because our generator also allowed constructing complex nested joins it was
possible to construct queries that would traverse the database _without any
authentication at all_.

For example, if you used the top level `userInfo(id: string)` resolver, it
would only allow you to retrieve public information about users other
than yourself. However, requesting a resource that was shared between users
would allow you nest a user request within it. In this case, the magical
generator routed the query internally and the authentication was not invoked.

This allowed requests like:

```
query {
  my {
    organisations {
        users {
            email
            passwordResetToken
        }
    }
  }
}
```

The result would be a list of all the emails and password reset tokens for all
the users in every organization you were connected to. The audit found
countless possible attack vectors of this nature, and it was ultimately
determined that any user with an account would not only be able to dump the
entire database, but also be able to mutate any entry within it.

Unfortunately, this was a little difficult to implement for this assignment
(both for me and for others to solve). Thus, I settled with a route that can
return more information than it should, and a password reset exploit to make 
it a bit more fun.

To ensure that multiple users can attempt the problem simultaneously the
application creates a new copy of the user data for each IP address that
accesses the server, and only allows retrieval and modification within that
scope of data. This means that each team can modify the password of the target
user without interfering with one another. It isn't bulletproof, and we're sure
there are ways that you could interfere with other groups (spoofing the source
IP with malicious requests would be one). It shouldn't be possible to do by
accident, and we sincerely hope the other groups won't attempt to sabotage each
other. 

# Step-by-step solution

Firstly, it's incredibly helpful to have access to the webpage directly, using
`ssh -L 1234:10.10.14:8080 group-vm` will forward the ports over SSH, allowing
you to access the website in the browser at `localhost:1234`. I will be
assuming this is how people will be approaching the problem, however it isn't
impossible to do this with curl.

1. The first step of the solution is for users to notice that the API requests
   the application makes are not standard REST requests. Whenever they land on
the homepage, or attempt a login a query is made to `/api/graphql`. With prior
knowledge, a quick google, or the first hint, an attacker should learn that
GraphQL often has introspection or even an interactive editor at that route.
Both will work, but the latter is significantly easier.

2. Navigating to `/api/graphql` will show an interactive editor that includes
documentation for the entire schema:

```
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
```

The first two queries if attempted will return an error that the user is not logged in.
The `users` route however has been "miss-configured" and allows unauthenticated requests 
to dump the entire users table, including hashed passwords and password reset tokens.

3. As they now have a list of all the users emails, one in particular should
   hopefully stand out: "flag@example.com". The attacker can then use the
`requestPasswordReset` mutation to request a password token, typically this
would be emailed to the user and wouldn't be too much of an issue. However, the
`users` query provides too much information, including the password reset
token. They can then use the password reset token to reset the password for `flag@example.com`.

4. Now the attacker has reset `flags` password, they can either login through
   the editor and use the `myNotes` query to retrieve the flag, or they can
simply login to the main application.

# Hints

The three hints are available in the application at `/hints`, they've been base64 encoded 
to avoid accidentally reading too much. We also included a little bit of a story with each
hint to tie it back to the original exploit that inspired this challenge.

## Hint 1

```
Have you seen what kind of API the login requests are made to?
That particular framework often exposes a lot more at it's root endpoint than you might expect...
Ultimately, the lesson here is don't expose any more about your internal APIs than you have to, and certainly not in production.
Fancy auto-generated swagger-docs and whatnot are very helpful for developers, and very very helpful for hackers.
```

## Hint 2

```
Have you tried all the queries?
Some of them might return a little more information than they should...
Especially to unauthenticated users...

The real vulnerability was a little more nuanced than this. 
In that case we found that a user could elevate certain database queries outside of their scope by traversing the graph with nested queries. 
With the way our resolvers worked only the top-level query had permission checks.
The moral here is quite simple: if you're gonna auto generate GraphQL from your database schema, make damn sure you understand what it's doing.
Even thorough unit tests didn't save us as coming from a rest background we didn't even know nested queries were possible.
```

## Hint 3

```
I'd hoped the previous two hints would have been enough.
But perhaps you're getting stuck on the passive side of things, so let me put your mind at ease;
The server creates a new set of user data for each team that connects to it. 
All of your requests are being scoped to that data. 
Provided you use the API normally you are free to perform any of the available queries or mutations that the server exposes.
That includes any that would change data on the server.
Of course, if you try hard enough it's probably possible to escape the encapsulation and mess with the other teams (so please don't).
```

# The flag

`EH2025{5618fc91f4bea53c1203f3cea4fb69e526cc5ae566550cd754707c297fc93779}`

# Additional tools

No additional tools should be necessary, the interactive web editor is part of
the solution here.

The previously mentioned ssh port forwarding would be handy though:

```
ssh -L localport:remotehost:remoteport group-vm
```

This will forward connections to `localhost:localport` on your local machine,
to `remotehost:remoteport` via the group-vm. This should probably be something
like `8080:10.10.0.14:8080`.

There are a handful of GraphQL compatible API editors like `Postman`, `Postwoman`, and `Bruno`.
I'm sure there are Kali linux variants of these, but they really shouldn't be needed.

If you want to run it locally, `docker compose up` should bring the whole 
stack up on `localhost:8080`. The database is seeded automatically.
