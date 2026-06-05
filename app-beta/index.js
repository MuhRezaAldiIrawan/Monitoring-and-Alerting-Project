const express = require("express");
const app = express();
const PORT = process.env.PORT || 3002;
const APP_NAME = process.env.APP_NAME || "App Beta";

let isHealthy = true;

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
    version: "2.1.0",
  });
});

app.get("/", (req, res) => {
  res.json({
    service: APP_NAME,
    description: "Payment Gateway Service",
    endpoints: ["/health", "/api/payments", "/api/transactions"],
  });
});

app.get("/api/payments", (req, res) => {
  res.json({ status: "gateway_online", supported: ["credit_card", "bank_transfer", "e-wallet"] });
});

app.get("/api/transactions", (req, res) => {
  res.json({ transactions: [{ id: "TRX001", amount: 150000, status: "success" }] });
});

// Toggle health (for simulation/demo)
app.post("/admin/toggle-health", (req, res) => {
  isHealthy = !isHealthy;
  res.json({ isHealthy, message: `Service is now ${isHealthy ? "healthy" : "unhealthy"}` });
});

app.listen(PORT, () => {
  console.log(`${APP_NAME} running on port ${PORT}`);
});
