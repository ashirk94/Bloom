# Bloom

This project was developed for my software engineering portfolio to demonstrate my full stack web development skills.
It is a unique social platform designed to create new friendships through shared interests and values.

Made in collaboration with [Sarah Martin](https://www.sarahmartinart.com/).

## Features

- Matching algorithm designed to connect people based on their ranked interests and values.
- Authentication implemented with the Passport and Bcrypt libraries.
- Location and distance measuring to pair users based on proximity.
<br>&nbsp;
- Written in TypeScript: a React frontend (React Router, Vite) talking to an Express JSON API, sharing one set of types for the data between them.
- Responsive animated navbar.
- Profile picture uploading with a preview display.
- User data storage with MongoDB and Mongoose.
- Admin area for data management.
<br>&nbsp;
- Instant messaging between users made with the socket.io library.
- Notifications on new messages.
- Title flashing and favicon changing to notify inactive users of messages.
- Message times convert to local time.
- A sidebar to switch between chatrooms.
<br>&nbsp;
- Was deployed to a Heroku Dyno utilizing continuous integration.
- Privacy Policy and Terms of Service.
- Logo and designs made by Sarah Martin.

## Project layout

```
server.ts        Express app: sessions, API routes, socket.io chat
config/          database connection, Passport login, interest/value options
models/          Mongoose models (User, Message)
routes/          JSON API, everything is served under /api
utilities/       matching algorithm, validation, messaging, helpers
shared/          TypeScript types used by both the server and the React app
types/           additions to library types (req.user, sessions)
tests/           Vitest tests for the server code
scripts/         one-time data migration
client/          React app (Vite)
  src/pages/       one component per page
  src/components/  pieces shared between pages
  src/context/     app-wide state: who is logged in, live chat
  src/lib/         small helpers and hooks
```

## Running it

Requires Node 22.18+ (it runs the TypeScript files directly) and a MongoDB database. Create a `.env` file in the project root:

```
DB_STRING=mongodb+srv://...
SESSION_SECRET=a-long-random-string
# optional: match people regardless of distance
DEMO_MODE=false
```

Then:

```
npm install      # installs the server and the client
npm run dev      # API on :3000, React app on http://localhost:5173
npm test         # run the tests (npm run test:watch reruns them as you edit)
npm run typecheck  # check the TypeScript types of the server and client
```

The server has no build step: Node removes the TypeScript types as it loads each file and runs the rest. Node doesn't check the types, so run `npm run typecheck` (your editor does the same checks as you type).

For production, `npm run build` type-checks and builds the React app into `client/dist`, and `npm start` serves both the API and the built React app from one port.

### Upgrading an existing database

Accounts created before the React rewrite store interests, friend requests and messages in an older shape. Preview the conversion, then apply it:

```
npm run migrate
npm run migrate -- --apply
```

The migration only adds the new fields; it never deletes the old ones.

## How matching works

Each person ranks up to five interests and five values. A rank is worth 5 points (first) down to 1 point (fifth). For everything two people share, their two rank weights are multiplied, so sharing your top interest with someone who also ranks it first counts far more than sharing a fifth choice. The total is divided by the best possible score to give a compatibility percentage, with interests and values counting equally. People within 50 km are shown, most compatible first, and between equally compatible people the closer one is listed first. See `utilities/matching.ts`.
