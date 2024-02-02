const express = require('express');
const app = express();

const tracer = require('dd-trace').init(); // Initialize Datadog Trace

app.use(express.json()); // Parse JSON request bodies

app.get("/", async (_, res) => {
  const span = tracer.startSpan('custom-span');
  span.setTag('custom-tag', 'tag-value');
  span.finish();
  console.log("span test, sample log for tracer span");
  console.log("Infra test, sample log for / route");

  res.status(200).json({"msg": "Hello world! Infra Team!"});
});

app.post("/postRoute", async (req, res) => {
  const requestBody = req.body;
  console.log("Infra test, Received POST request with body:", requestBody);
  res.status(200).json({"msg": "POST request received successfully! Infra Team!"});
});

const port = process.env.PORT || 80;
app.listen(port, () => console.log(`Application is now ready, listening to: ${port} randomId: ${Math.random()}`));
