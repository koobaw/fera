const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const port = process.env.PORT || 8080;

// Use middleware to parse JSON request bodies
app.use(bodyParser.json());

// Define the route for handling the task
app.post("/taskHandler", async (req, res) => {
  console.log("body", JSON.stringify(req.body));
  const a = req.body.a;
  const b = req.body.b;
  const result = a + b;

  // Artificial delay to reflect task uncertainty
  await new Promise((resolve) => {
    setTimeout(resolve, 500 + Math.floor(Math.random() * 1000));
  });

  console.log("a", a, "b", b, "result", result);

  res.json({ result });
});

// Start the Express app
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
