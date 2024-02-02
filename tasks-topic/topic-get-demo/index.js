const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

app.post("/", (req, res) => {
  try {
    const messageData = req.body.message.data
      ? Buffer.from(req.body.message.data, "base64").toString("utf-8")
      : "";

    console.log(messageData);
    const jsonData = JSON.parse(messageData);

    const a = jsonData.a || 0;
    const b = jsonData.b || 0;

    const result = a + b;

    console.log(`Received message: a=${a}, b=${b}, sum=${result}`);

    res.status(200).send(`Sum of a and b is: ${result}`);
  } catch (error) {
    console.error("Error processing message:", error);
    res.status(500).send("Internal Server Error");
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
