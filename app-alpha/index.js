const express = require("express");
const app = express();
const PORT = process.env.PORT || 3001;
const APP_NAME = process.env.APP_NAME || "App Alpha";

let isHealthy = true;

// Simulate occasional failures (for demo purposes)
// In real usage, this reflects actual service health
app.get("/health", (req, res) => {
  if (!isHealthy) {
    return res.status(503).json({
      status: "down",
      service: APP_NAME,
      timestamp: new Date().toISOString(),
      message: "Service is temporarily unavailable",
    });
  }

  res.status(200).json({
    status: "ok",
    service: APP_NAME,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: "1.0.0",
  });
});

// Main endpoint
app.get("/", (req, res) => {
  res.json({
    service: APP_NAME,
    description: "E-commerce API Service",
    endpoints: ["/health", "/api/products", "/api/orders"],
  });
});

// Simulated API endpoints
app.get("/api/products", (req, res) => {
  res.json({ products: ["Product A", "Product B", "Product C"] });
});

app.get("/api/orders", (req, res) => {
  res.json({ orders: [{ id: 1, status: "pending" }] });
});

// Toggle health (for simulation/demo)
app.post("/admin/toggle-health", (req, res) => {
  isHealthy = !isHealthy;
  res.json({ isHealthy, message: `Service is now ${isHealthy ? "healthy" : "unhealthy"}` });
});

app.listen(PORT, () => {
  console.log(`${APP_NAME} running on port ${PORT}`);
});
