const express = require('express');
const http = require('http');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');

// In-memory store for demo only. Replace with DB (Postgres) in production.
const users = {}; // { email: { passwordHash, id, profile } }
let messages = []; // simple message array for public rooms

const JWT_SECRET = process.env.JWT_SECRET || 'change_this_in_prod';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/ping', (req, res) => res.json({ ok: true }));

app.post('/api/signup', async (req, res) => {
  const { email, password } = req.body;
  if(!email || !password) return res.status(400).json({ error: 'email & password required' });
  if(users[email]) return res.status(409).json({ error: 'user exists' });
  const hash = await bcrypt.hash(password, 10);
  const id = Date.now().toString(36);
  users[email] = { id, passwordHash: hash, profile: { email } };
  const token = jwt.sign({ sub: id, email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id, email } });
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const u = users[email];
  if(!u) return res.status(401).json({ error: 'invalid' });
  const ok = await bcrypt.compare(password, u.passwordHash);
  if(!ok) return res.status(401).json({ error: 'invalid' });
  const token = jwt.sign({ sub: u.id, email }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user: { id: u.id, email } });
});

// Simple protected route example
app.get('/api/me', (req, res) => {
  const auth = req.headers.authorization;
  if(!auth) return res.status(401).json({ error: 'missing token' });
  const parts = auth.split(' ');
  if(parts.length!==2) return res.status(401).json({ error: 'bad token' });
  try{
    const payload = jwt.verify(parts[1], JWT_SECRET);
    return res.json({ user: { id: payload.sub, email: payload.email } });
  }catch(e){ return res.status(401).json({ error: 'invalid' }); }
});

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

io.on('connection', (socket) => {
  console.log('socket connected', socket.id);
  // join default room
  socket.join('public');
  socket.emit('messages', messages);

  socket.on('chat:message', (m) => {
    const msg = { id: Date.now(), text: m.text, author: m.author, ts: Date.now() };
    messages.push(msg);
    io.to('public').emit('chat:message', msg);
  });

  socket.on('disconnect', () => console.log('socket disconnect', socket.id));
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, ()=>console.log('Server listening on', PORT));
