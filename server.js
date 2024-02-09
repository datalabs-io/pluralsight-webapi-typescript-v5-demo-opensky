const express = require('express');
const http = require('http');
const fs = require('fs');
const WebSocket = require('ws');
const cors = require('cors');
const bodyParser = require('body-parser');
const { RateLimiter } = require("limiter");

const app = express();
const port = 4000;

const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());
app.use(express.static('public'));
app.use(bodyParser.json());

const whitelist = ['http://localhost:3000'];
const corsOptions = {
  origin: (origin, callback) => {
    if (whitelist.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

app.use(cors(corsOptions));

const apiLimiter = new RateLimiter({ tokensPerInterval: 10, interval: 'second' });

const users = [{ username: 'admin', password: 'admin' }];

let isAuthenticated = false;

const authenticate = (req, res, next) => {
  if (isAuthenticated) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username && u.password === password);
  if (user) {
    isAuthenticated = true;
    res.status(200).json({ message: 'Login successful' });
  } else {
    isAuthenticated = false;
    res.status(401).json({ message: 'Login failed' });
  }
});

let counter = 0;

let broadcastInterval;

function broadcastDataToClients() {
  const fileName = `data${counter}.json`;
  const filePath = `./uploads/${fileName}`;

  if (fs.existsSync(filePath)) {
    const dataFromFile = fs.readFileSync(filePath, 'utf-8');

    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          const jsonData = JSON.parse(dataFromFile);
          client.send(JSON.stringify(jsonData));
        } catch (error) {
          console.error('Error parsing JSON data:', error);
        }
      }
    });

    counter++;
  } else {
    console.log(`File ${fileName} not found. Broadcasting stopped.`);
    clearInterval(broadcastInterval);
  }
}

broadcastInterval = setInterval(broadcastDataToClients, 3000);

wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
  });

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

const v1Router = express.Router();
v1Router.get('/opensky-local', authenticate, async (req, res) => {
  try {
    await apiLimiter.removeTokens(1);
    if (req.query.fileId) {
      let jsonFile = req.query.fileId;
      console.log(jsonFile);
      const filePath = `./uploads/${jsonFile}.json`;

      if (fs.existsSync(filePath)) {
        try {
          const dataFromFile = fs.readFileSync(filePath, 'utf-8');
          const jsonData = JSON.parse(dataFromFile);

          res.json({
            data: jsonData,
          });
        } catch (error) {
          console.error('Error parsing JSON data:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      } else {
        res.status(404).json({ error: 'File not found' });
      }
    } else {
      res.status(400).json({ error: 'Bad Request' });
    }
  } catch (error) {
    res.status(429).json({ error: 'Rate limit exceeded' });
  }
});

const v2Router = express.Router();
v2Router.get('/opensky-local', authenticate, async (req, res) => {
  try {
    await apiLimiter.removeTokens(1);
    if (req.query.fileId) {
      let jsonFile = req.query.fileId;
      console.log(jsonFile);
      const filePath = `./uploads/${jsonFile}.json`;

      if (fs.existsSync(filePath)) {
        try {
          const dataFromFile = fs.readFileSync(filePath, 'utf-8');
          const jsonData = JSON.parse(dataFromFile);

          const totalStates = jsonData.states.length;

          res.json({
            data: jsonData,
            total: totalStates,
          });
        } catch (error) {
          console.error('Error parsing JSON data:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
      } else {
        res.status(404).json({ error: 'File not found' });
      }
    } else {
      res.status(400).json({ error: 'Bad Request' });
    }
  } catch (error) {
    res.status(429).json({ error: 'Rate limit exceeded' });
  }
});

app.use('/v1', v1Router);
app.use('/v2', v2Router);

server.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
