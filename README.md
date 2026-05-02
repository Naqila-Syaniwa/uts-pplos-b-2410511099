# ReserveIt — Microservices Booking System

## Identitas

* Nama: Naqila Syaniwa
* NIM: 2410511099
* Mata Kuliah: Pembangunan Perangkat Lunak Berorientasi Service

---

## Kebutuhan Sistem

Pastikan sudah menginstall:

* Node.js
* PHP (≥ 8)
* Composer
* MySQL

---

## Cara Menjalankan

### 1. Install Dependencies

#### Auth Service

```bash
cd services/auth-service
npm install
```

#### Booking Service

```bash
cd services/booking-service
npm install
```

#### API Gateway

```bash
cd gateway
npm install
```

#### Field Service (CodeIgniter 4)

```bash
cd services/field-service
composer install
```

---

### 2. Menjalankan Service

#### Auth Service (Port 3001)

```bash
cd services/auth-service
node server.js
```

#### Booking Service (Port 3003)

```bash
cd services/booking-service
node server.js
```

#### API Gateway (Port 3000)

```bash
cd gateway
node server.js
```

#### Field Service (CodeIgniter 4)

```bash
cd services/field-service
php spark serve
```

Default berjalan di:

```
http://localhost:8080
```

---

## Peta Endpoint

### Auth Service (melalui Gateway)

* POST /auth/register
* POST /auth/login
* POST /auth/refresh
* POST /auth/logout
* GET /auth/me

---

### Field Service (melalui Gateway)

* GET /fields
* GET /fields/{id}
* GET /schedules

---

### Booking Service (melalui Gateway)

* POST /bookings
* GET /bookings

---

## Base URL Gateway

```
http://localhost:3000
```

---

## Autentikasi

Endpoint berikut memerlukan token:

```
Authorization: Bearer <access_token>
```

Digunakan untuk:

* /fields
* /bookings
* /schedules

---

## OAuth GitHub Login

### Konfigurasi

Tambahkan pada file `.env` di `services/auth-service`:

```
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_CALLBACK=http://localhost:3001/auth/github/callback
```

---

### Setup di GitHub

1. Buka: https://github.com/settings/developers
2. Pilih **OAuth Apps → New OAuth App**
3. Isi:

* Homepage URL:

```
http://localhost:3000
```

* Authorization callback URL:

```
http://localhost:3001/auth/github/callback
```

4. Salin **Client ID** dan **Client Secret** ke `.env`

---

### Cara Menjalankan OAuth

Akses melalui browser (bukan Postman):

```
http://localhost:3001/auth/github
```

Alur:

1. Redirect ke GitHub login
2. User login
3. Redirect kembali ke:

```
/auth/github/callback
```

---

### Response

Setelah login berhasil:

```json
{
  "accessToken": "...",
  "refreshToken": "..."
}
```

---

### Penggunaan Token

Gunakan token untuk akses endpoint lain:

```
GET http://localhost:3001/protected
Authorization: Bearer <accessToken>
```

---
### Link Youtube
https://youtu.be/HStcc_vyE7Q
---

## Catatan

* Endpoint `/auth` tidak memerlukan token (public)
* OAuth dijalankan langsung dari Auth Service (port 3001)
* Disarankan menggunakan browser untuk OAuth flow
