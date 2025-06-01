const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.locals.items = [];
app.locals.nextId = 1;

app.get('/', (req, res) => {
  res.send('Hello, Jenkins Pipeline!');
});

//Health check
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

//CRUD endpoints
app.get('/api/items', (req, res) => {
  res.json(app.locals.items);
});

app.post('/api/items', (req, res) => {
  const newItem = { id: app.locals.nextId++, name: req.body.name };
  app.locals.items.push(newItem);
  res.status(201).json(newItem);
});

app.put('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = app.locals.items.findIndex(i => i.id === id);
  if (idx === -1) {
    return res.status(404).send();
  }
  app.locals.items[idx].name = req.body.name;
  res.json(app.locals.items[idx]);
});

app.delete('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = app.locals.items.findIndex(i => i.id === id);
  if (idx === -1) {
    return res.status(404).send();
  }
  app.locals.items.splice(idx, 1);
  res.status(204).send();
});

function resetData() {
  app.locals.items = [];
  app.locals.nextId = 1;
}

module.exports = { app, resetData };

if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}



