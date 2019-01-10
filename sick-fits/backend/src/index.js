const cookierParser = require('cookie-parser');

require('dotenv').config({ path: 'variables.env' });
const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

// TODO: use express middleware to handle cookies (JWT)
// a middleware is a function that runs in the middle of the request and the response.
// allow us to access all of the cookies as a formatted object (instead of just a cookie string that it comes in as in the header)
server.express.use(cookierParser());
// TODO: use express middleware to populate current user

server.start({
  cors: { // only allow endpoint to be visited by approved urls.
    credentials: true,
    origin: process.env.FRONTEND_URL,
  }
}, deets => {
  console.log(`Server is now running on port http://localhost:${deets.port}`);
});
