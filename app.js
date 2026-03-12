const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 8080;

// In-memory storage of last 100 events
const eventHistory = [];
const MAX_HISTORY = 100;

// Connected SSE clients
let clients = [];

// SSE endpoint
app.get("/events/stream", (req, res) => {
  res.set({
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });
  res.flushHeaders();

  // Send last events on connect
  eventHistory.forEach((event) =>
    res.write(`data: ${JSON.stringify(event)}\n\n`),
  );

  clients.push(res);

  req.on("close", () => {
    clients = clients.filter((c) => c !== res);
  });
});

// Historical events endpoint
app.get("/events", (req, res) => {
  res.json({ events: eventHistory });
});

// Receive new events from n8n
app.post("/events", (req, res) => {
  const event = req.body;

  // Add to history
  eventHistory.push(event);
  if (eventHistory.length > MAX_HISTORY) eventHistory.shift();

  // Push to all connected SSE clients
  clients.forEach((c) => c.write(`data: ${JSON.stringify(event)}\n\n`));

  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Event-Stream Service running on port ${PORT}`);
});
