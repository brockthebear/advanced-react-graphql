const cookierParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

require('dotenv').config({ path: 'variables.env' });
const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

// a middleware is a function that runs in the middle of the request and the response.
// allow us to access all of the cookies as a formatted object (instead of just a cookie string that it comes in as in the header)
server.express.use(cookierParser());
// decode the JWT so we can get the user ID on each request.
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

server.start({
  cors: { // only allow endpoint to be visited by approved urls.
    credentials: true,
    origin: process.env.FRONTEND_URL,
  }
}, deets => {
  console.log(`Server is now running on port http://localhost:${deets.port}`);
});
