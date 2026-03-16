# 📊 TrackVentas

**TrackVentas** is a sales management system designed to help small businesses manage products, purchases, sales, suppliers, and customers.

The system provides a fullstack architecture with a **React frontend**, **Node.js + Express backend**, and **SQL Server database**.

---

## 🚀 Features

* 🔐 User authentication and role-based access
* 📦 Product management
* 🧾 Sales registration
* 🛒 Purchase tracking
* 👥 Customer management
* 🏢 Supplier management
* ⚙️ Business configuration panel

---

## 🛠️ Tech Stack

### Frontend

* React
* Vite
* TypeScript
* Axios

### Backend

* Node.js
* Express
* JWT Authentication
* REST API

### Database

* SQL Server

---

## 📂 Project Structure

```id="9s9x8a"
trackventas
│
├── TVFrontend        # React + Vite frontend
│
├── TVBackend         # Node.js + Express backend
│
└── SQLinfoschema.sql # Database schema
```

---

## ⚙️ Installation

### 1️⃣ Clone the repository

```id="x0m1fl"
git clone https://github.com/Sofitoo/TrackVentas-Public.git
cd TrackVentas-Public
```

---

### 2️⃣ Backend setup

```id="tkhccm"
cd TVBackend
npm install
npm run dev
```

---

### 3️⃣ Frontend setup

```id="pd1vo0"
cd TVFrontend
npm install
npm run dev
```

---

### 4️⃣ Database

Import the schema into **SQL Server**:

```id="0vgyxq"
SQLinfoschema.sql
```

---

## 🔐 Authentication

The backend uses **JWT-based authentication** with middleware to protect routes and manage role-based access.

---

## 📌 Project Status

🚧 Work in progress.

TrackVentas was developed as a fullstack project to experiment with **API design, authentication, and business management systems**.

Future improvements may include:

* reporting and analytics
* improved UI/UX
* deployment with Docker
* cloud database integration

---

## 👩‍💻 Author

Developed by **Sofía Olariaga**.
