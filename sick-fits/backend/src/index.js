const cookierParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

require('dotenv').config({ path: 'variables.env' });
const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

// Allow us to access all of the cookies as a formatted object (instead of just a cookie string that it comes in as in the header)
server.express.use(cookierParser());

/**
 * MIDDLEWARE
 */

// 1. Decode the JWT so we can get the user ID on each request.
server.express.use((req, res, next) => {
  // pull token out of the request
  const { token } = req.cookies;
  if (token) {
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    // put the userId onto the request for future requests to access.
    req.userId = userId;
  }
  next();
});

// 2. Create a middleware that populates the user in each request.
// We will want access to the user on each request if they are logged in.
server.express.use(async (req, res, next) => {
  // Skip this if the user is not logged in.
  if (!req.userId) return next();
  const user = await db.query.user(
    { where: { id: req.userId } },
    '{ id, permissions, email, name }'
  );
  req.user = user;
  next();
});

/**
 * END MIDDLEWARE
 */

server.start({
  cors: { // only allow endpoint to be visited by approved urls.
    credentials: true,
    origin: process.env.FRONTEND_URL,
  }
}, deets => {
  console.log(`Server is now running on port http://localhost:${deets.port}`);
});
