const express = require('express');
const app = express();

// GET
app.get('/', (req, res) => {
  const name = 'Infra Team';
  res.send(`Hello ${name}! (GET)`);
});

// POST
app.post('/postRoute', (req, res) => {
  const name = 'Infra Team';
  res.send(`Hello ${name}! (POST)`);
});

const port = 8080;
app.listen(port, () => {
  console.log(`helloworld: listening on port ${port}`);
});

module.exports = app;

