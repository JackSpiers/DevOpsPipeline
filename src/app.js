const express = require('express');
const app = express();

app.use(express.json());

let tasks = [];
let nextId = 1;

//GET /tasks — return all tasks
app.get('/tasks', (req, res) => {
  res.json(tasks);
});

//POST /tasks — create task
app.post('/tasks', (req, res) => {
  const { title, completed } = req.body;
  const newTask = { id: nextId++, title, completed: !!completed };
  tasks.push(newTask);
  res.status(201).json(newTask);
});

//GET /tasks/:id — get task by id
app.get('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === Number(req.params.id));
  if (!task) return res.status(404).send('Task not found');
  res.json(task);
});

//PUT /tasks/:id — update task
app.put('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === Number(req.params.id));
  if (!task) return res.status(404).send('Task not found');
  const { title, completed } = req.body;
  if (title !== undefined) task.title = title;
  if (completed !== undefined) task.completed = completed;
  res.json(task);
});

//DELETE /tasks/:id — delete task
app.delete('/tasks/:id', (req, res) => {
  const index = tasks.findIndex(t => t.id === Number(req.params.id));
  if (index === -1) return res.status(404).send('Task not found');
  tasks.splice(index, 1);
  res.status(204).send();
});

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'UP' });
});

module.exports = app;
