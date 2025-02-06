const http = require('http');


// Mock database
const db = new Map([
  ['users', [
    { id: 1, name: 'joe' },
    { id: 2, name: 'john' },
    { id: 3, name: 'jane' },
  ]],
])


// Create the server
const server = http.createServer((req, res) => {

  // Fetch users
  if (req.method === 'GET' && req.url === '/users') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    const users = db.get('users');
    res.end(JSON.stringify(users));

  // Add user
  } else if (req.method === 'POST' && req.url === '/users') {
    let respObj;
    req.on('data', chunk => {
      const incomingData = JSON.parse(chunk.toString());
      const currentUsers = db.get('users');
      currentUsers?.push(incomingData);
      respObj = currentUsers;
    });
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(respObj));
    });

  // Update user
  } else if (req.method === 'PUT' && req.url === '/users') {
    let respObj;
    req.on('data', chunk => {
      const incomingData = JSON.parse(chunk.toString()),
        currentUsers = db.get('users') ?? [];
      for (const user of currentUsers) {
        if (user.id === incomingData.id) {
          user.name = incomingData.name;
          break;
        }
      }
      respObj = currentUsers;
    });
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(respObj));
    });

  // Delete a user
  } else if (req.method === 'DELETE' && req.url === '/users') {
    let respObj;
    req.on('data', chunk => {
      const incomingData = JSON.parse(chunk.toString()),
        currentUsers = db.get('users') ?? [];
      let index = -1;
      for (let i = 0; i < currentUsers.length; i++) {
        if (currentUsers[i].id === incomingData.id) {
          index = i;
          break;
        }
      }
      currentUsers.splice(index, 1);
      respObj = currentUsers;
    });
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(respObj));
    });

  // Not found error
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'Route not found' }));
  }
});

// Start listening
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
