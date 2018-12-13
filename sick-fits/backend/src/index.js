require('dotenv').config({ path: 'variables.env' });
const createServer = require('./createServer');
const db = require('./db');

const server = createServer();

// TODO: use express middleware to handle cookies (JWT)
// TODO: use express middleware to populate current user

server.start({
  cors: { // only allow endpoint to be visited by approved urls.
    credentials: true,
    origin: process.env.FRONTEND_URL,
  }
}, deets => {
  console.log(`Server is now running on port http://localhost:${deets.port}`);
});
