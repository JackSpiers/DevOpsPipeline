
const express = require('express');
const app     = express();
const port    = process.env.PORT || 3000;

let items = [];
let nextId = 1;

app.get('/', (req, res) => {
  res.send('Hello, Jenkins Pipeline!');
});

//Health check (for monitoring)
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

//CRUD endpoints
app.use(express.json()); 

app.get('/api/items', (req, res) => {
  res.json(items);
});

app.post('/api/items', (req, res) => {
  const newItem = { id: nextId++, name: req.body.name };
  items.push(newItem);
  res.status(201).json(newItem);
});

app.put('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) {
    return res.status(404).send();
  }
  items[idx].name = req.body.name;
  res.json(items[idx]);
});

app.delete('/api/items/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const idx = items.findIndex(i => i.id === id);
  if (idx === -1) {
    return res.status(404).send();
  }
  items.splice(idx, 1);
  res.status(204).send();
});

module.exports = app;
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}




