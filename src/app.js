
const express = require('express');
const app = express();

app.use(express.json()); //IMPORTANT: enable JSON parsing for POST/PUT

app.get('/', (req, res) => {
  res.send('Task Manager running.');
});

module.exports = app;
