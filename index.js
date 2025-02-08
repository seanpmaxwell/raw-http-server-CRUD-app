const http = require('http');


// **** Variables **** //

const HEADERS = {
  'Content-Type': 'application/json',
  'Connection': 'close',
};


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
    res.writeHead(200, HEADERS);
    const users = db.get('users');
    console.log('users fetched');
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
        console.log('user added');
        res.writeHead(201, HEADERS);
        res.end(JSON.stringify(currentUsers));
      } catch (err) {
        res.writeHead(400, HEADERS);
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
          res.writeHead(404, HEADERS);
          res.end(JSON.stringify({ message: "User not found" }));
          return;
        }
        console.log('user updated');
        res.writeHead(201, HEADERS);
        res.end(JSON.stringify(currentUsers));
      } catch (err) {
        res.writeHead(400, HEADERS);
        res.end(JSON.stringify({ message: "Bad Request" }));
      }
    });

  // Delete a user
  } else if (req.method === 'DELETE' && req.url?.startsWith('/users')) {
    const arr = req.url?.split('/') ?? [],
      id = Number(arr[arr?.length - 1]),
      currentUsers = db.get('users') ?? [];
    let found = false;
    for (let i = 0; i < currentUsers.length; i++) {
      if (currentUsers[i].id === id) {
        currentUsers.splice(i, 1);
        found = true;
        break;
      }
    }
    if (!found) {
      res.writeHead(404, HEADERS);
      res.end(JSON.stringify({ message: "User not found" }));
      return;
    }
    console.log('user deleted');
    res.writeHead(201, HEADERS);
    res.end(JSON.stringify(currentUsers));
  // Not found error
  } else {
    res.writeHead(404, HEADERS);
    res.end(JSON.stringify({ message: 'Route not found' }));
  }
});


// **** Start listening **** //

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});


// **** Close server when process exits **** //

process.on('SIGTERM', () => {
  console.log('SIGTERM received')
  server.close(() => {
    console.log('server closed successfully');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received')
  server.close(() => {
    console.log('server closed successfully');
  });
});
