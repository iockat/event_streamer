const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 8080;
// Connected SSE clients
let clients = [];

// SSE endpoint
app.get("/stream", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders();

  // Send initial empty data on connect
  res.write(`data: ${JSON.stringify({})}\n\n`);

  clients.push(res);

  req.on("close", () => {
    clients = clients.filter((c) => c !== res);
  });
});

// Receive new events
app.post("/stream", (req, res) => {
  const event = req.body;
  // Push to all connected SSE clients
  clients.forEach((c) => c.write(`data: ${JSON.stringify(event)}\n\n`));
  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Event-Stream Service running on port ${PORT}`);
});
