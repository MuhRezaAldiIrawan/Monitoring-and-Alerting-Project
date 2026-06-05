const express = require("express");
const client = require("prom-client");

const app = express();
const PORT = process.env.PORT || 3001;
const APP_NAME = process.env.APP_NAME || "App Alpha";

// ─── Prometheus Registry ──────────────────────────────────
const register = new client.Registry();
register.setDefaultLabels({ app: "app-alpha" });

// ─── Metrics ─────────────────────────────────────────────
const httpRequestsTotal = new client.Counter({
  name: "app_alpha_http_requests_total",
  help: "Total number of HTTP requests",
  labelNames: ["method", "route", "status_code"],
  registers: [register],
});

const httpRequestDuration = new client.Histogram({
  name: "app_alpha_http_request_duration_seconds",
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status_code"],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5],
  registers: [register],
});

const serviceHealth = new client.Gauge({
  name: "app_alpha_service_health",
  help: "Service health status (1 = healthy, 0 = down)",
  registers: [register],
});

const uptimeGauge = new client.Gauge({
  name: "app_alpha_process_uptime_seconds",
  help: "Process uptime in seconds",
  registers: [register],
  collect() {
    this.set(process.uptime());
  },
});

const memoryGauge = new client.Gauge({
  name: "app_alpha_process_resident_memory_bytes",
  help: "Resident memory size in bytes",
  registers: [register],
  collect() {
    this.set(process.memoryUsage().rss);
  },
});

// Start healthy
serviceHealth.set(1);

// ─── Request instrumentation middleware ──────────────────
app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on("finish", () => {
    const route = req.route ? req.route.path : req.path;
    const labels = { method: req.method, route, status_code: res.statusCode };
    httpRequestsTotal.inc(labels);
    end(labels);
  });
  next();
});

let isHealthy = true;

// ─── Routes ──────────────────────────────────────────────
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

app.get("/", (req, res) => {
  res.json({
    service: APP_NAME,
    description: "E-commerce API Service",
    endpoints: ["/health", "/metrics", "/api/products", "/api/orders"],
  });
});

app.get("/api/products", (req, res) => {
  res.json({ products: ["Product A", "Product B", "Product C"] });
});

app.get("/api/orders", (req, res) => {
  res.json({ orders: [{ id: 1, status: "pending" }] });
});

app.post("/admin/toggle-health", (req, res) => {
  isHealthy = !isHealthy;
  serviceHealth.set(isHealthy ? 1 : 0);
  res.json({ isHealthy, message: `Service is now ${isHealthy ? "healthy" : "unhealthy"}` });
});

// ─── Metrics endpoint ─────────────────────────────────────
app.get("/metrics", async (req, res) => {
  res.set("Content-Type", register.contentType);
  res.end(await register.metrics());
});

app.listen(PORT, () => {
  console.log(`${APP_NAME} running on port ${PORT}`);
});
