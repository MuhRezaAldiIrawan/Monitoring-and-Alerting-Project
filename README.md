# 🖥️ Monitoring Stack — Setup Guide

Stack ini terdiri dari:

- **Uptime Kuma** — monitoring dashboard & alert engine
- **App Alpha** — simulasi E-Commerce API service
- **App Beta** — simulasi Payment Gateway service
- **Status Page** — halaman publik seperti Bitbucket/Xendit status page

---

## 🚀 Quick Start

```bash
# Clone atau masuk ke folder project Monitoring updated for green flag
cd monitoring-project

# Build dan jalankan semua service
docker compose up -d --build

# Cek status
docker compose ps
```

### Service URLs setelah running:

| Service            | URL                          | Keterangan           |
| ------------------ | ---------------------------- | -------------------- |
| Uptime Kuma        | http://localhost:3000        | Dashboard monitoring |
| App Alpha (health) | http://localhost:4001/health | E-Commerce API       |
| App Beta (health)  | http://localhost:4002/health | Payment Gateway      |
| Status Page        | http://localhost:8080        | Public status page   |

---

## ⚙️ Setup Uptime Kuma (Pertama Kali)

### 1. Buka http://localhost:3000

Buat akun admin pertama kali (username + password).

### 2. Tambah Monitor untuk App Alpha

- Klik **"Add New Monitor"**
- **Monitor Type**: HTTP(s)
- **Friendly Name**: `E-Commerce API`
- **URL**: `http://app-alpha:3001/health`
  > ⚠️ Gunakan nama container `app-alpha` karena dalam satu Docker network
- **Heartbeat Interval**: 60 detik
- **Retries**: 3
- **Expected Status Code**: 200
- Klik **Save**

### 3. Tambah Monitor untuk App Beta

- **Monitor Type**: HTTP(s)
- **Friendly Name**: `Payment Gateway`
- **URL**: `http://app-beta:3002/health`
- **Heartbeat Interval**: 60 detik
- Klik **Save**

---

## 📧 Setup Email Notification (Gmail)

### Langkah 1 — Siapkan Gmail App Password

1. Buka https://myaccount.google.com/security
2. Aktifkan **2-Step Verification** jika belum
3. Masuk ke **"App passwords"**
4. Generate password untuk "Mail" → **catat 16-digit password**

### Langkah 2 — Tambah Notification di Uptime Kuma

1. Buka **Settings → Notifications**
2. Klik **"Setup Notification"**
3. Pilih type: **Email (SMTP)**
4. Isi konfigurasi:

```
Friendly Name : Gmail Alert
Hostname      : smtp.gmail.com
Port          : 465
Security      : TLS/SSL
Username      : your-email@gmail.com
Password      : [App Password 16 digit]
From Email    : your-email@gmail.com
To Email      : recipient@gmail.com
```

5. Klik **"Test"** → cek inbox
6. Klik **Save**

### Langkah 3 — Attach Notification ke Monitor

1. Buka monitor **E-Commerce API**
2. Edit → scroll ke **"Notifications"**
3. Centang Gmail Alert
4. Lakukan hal sama untuk **Payment Gateway**

> 💡 **Alternatif SMTP lain**: SendGrid, Mailgun, AWS SES, atau Mailtrap (untuk dev/testing)

---

## 🧪 Simulasi Down / Alert

Untuk test alert email, kamu bisa matikan service:

```bash
# Matikan App Alpha (simulasi down)
docker compose stop app-alpha

# Tunggu ~2 menit → Uptime Kuma akan detect down → kirim email

# Hidupkan kembali
docker compose start app-alpha
```

Atau toggle health endpoint via HTTP:

```bash
# Set App Alpha jadi unhealthy (return 503)
curl -X POST http://localhost:4001/admin/toggle-health

# Kembalikan ke healthy
curl -X POST http://localhost:4001/admin/toggle-health
```

---

## 📊 Status Page Publik

Status page ada di `status-page/index.html`.

**Untuk production**, update status page agar fetch data dari Uptime Kuma API:

- Uptime Kuma punya **Status Page** built-in di Settings → Status Page
- Atau bisa pakai API: `GET /api/status-page/heartbeat/:slug`

---

## 🛑 Menghentikan Stack

```bash
# Stop semua
docker compose down

# Stop + hapus volume (reset Uptime Kuma data)
docker compose down -v
```

---

## 📁 Struktur Project

```
monitoring-project/
├── docker-compose.yml       # Orchestration utama
├── app-alpha/
│   ├── index.js             # E-Commerce API service
│   ├── package.json
│   └── Dockerfile
├── app-beta/
│   ├── index.js             # Payment Gateway service
│   ├── package.json
│   └── Dockerfile
└── status-page/
    ├── index.html           # Public status page
    └── nginx.conf           # Nginx config
```
