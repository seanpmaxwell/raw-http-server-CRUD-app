const http = require('http');


// **** Setup Mock database **** //

const db = new Map([
  ['users', [
    { id: 1, name: 'joe' },
    { id: 2, name: 'john' },
    { id: 3, name: 'jane' },
  ]],
])


// **** Create the server **** //

/**
 * Note "chunk" is a BufferInputStream so we do "body += chunk" to concatenate 
 * the chunks as they come in.
 */
const server = http.createServer((req, res) => {

  // Fetch users
  if (req.method === 'GET' && req.url === '/users') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const users = db.get('users');
    res.end(JSON.stringify(users));

  // Add user
  } else if (req.method === 'POST' && req.url === '/users') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const incomingData = JSON.parse(body),
          currentUsers = db.get('users');
        currentUsers?.push(incomingData);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(currentUsers));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Bad Request" }));
      }
    });

  // Update user
  } else if (req.method === 'PUT' && req.url === '/users') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const incomingData = JSON.parse(body),
          currentUsers = db.get('users') ?? [];
        let found = false;
        for (const user of currentUsers) {
          if (user.id === incomingData.id) {
            user.name = incomingData.name;
            found = true;
            break;
          }
        }
        if (!found) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: "User not found" }));
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(currentUsers));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Bad Request" }));
      }
    });

  // Delete a user
  } else if (req.method === 'DELETE' && req.url === '/users') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
    });
    req.on('end', () => {
      try {
        const incomingData = JSON.parse(body),
          currentUsers = db.get('users') ?? [];
        let index = -1,
          found = false;
        for (let i = 0; i < currentUsers.length; i++) {
          if (currentUsers[i].id === incomingData.id) {
            index = i;
            found = true;
            break;
          }
        }
        if (!found) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ message: "User not found" }));
        }
        currentUsers.splice(index, 1);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(currentUsers));
      } catch (err) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: "Bad Request" }));
      }
    });

  // Not found error
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Route not found' }));
  }
});


// **** Start listening **** //

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});


// **** Close server when process exits **** //

process.on('SIGTERM', async () => {
  console.log('SIGTERM received')
  server.close(() => {
    console.log('server closed successfully');
  });
});

process.on('SIGINT', async () => {
  console.log('SIGINT received')
  server.close(() => {
    console.log('server closed successfully');
  });
});
