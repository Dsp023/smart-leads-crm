# ⚡ Smart Leads CRM (MERN + TypeScript)

[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-Orchestrated-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

A production-grade, full-stack **Customer Relationship Management (CRM) & Lead Ingestion Dashboard** engineered with a strict TypeScript-first MERN stack. Designed with a high-fidelity glassmorphic visual system, robust role-based security filters, streaming exports, and containerized Docker orchestration.

---

## 🌟 Core Architectural Features

### 1. Robust Security & Identity Management
- **🛡️ Secure JWT Authentication System**: Implements a standard Bearer token scheme. User sessions are verified via secure tokens stored on the client and parsed in headers.
- **🔐 Role-Based Access Control (RBAC)**: Supports roles for `Admin` and `Sales User`. Lead deletion is strictly guarded at both the database middleware layers and UI controllers. Sales users are prevented from triggering deletion, with a locked-padlock visual indicator and descriptive helper tooltip.

### 2. High-Fidelity UI/UX Visual System
- **🎨 Glassmorphic Interface**: Beautiful, responsive layout styled with deep slate backdrops, low-saturation borders, and premium frosted glass modal overlays (`backdrop-blur-md`).
- **📱 Custom React Popover Dropdowns**: Replaced default browser `<select>` inputs with custom-designed React popover modules to enforce a unified look across Safari, Chrome, and Firefox.
- **📈 Pulsing Micro-Badge Indicators**: Employs live glowing pings (pulsing indicator dots) for status badges (e.g. `Qualified` and `New`) to create a polished SaaS dashboard aesthetic.
- **🌓 Native Light/Dark Mode**: Smooth-shifting ambient transitions with custom scrollbars and adaptive text high-contrast colors.

### 3. Advanced Query Performance & UX
- **🔍 Advanced Multi-Query Engine**: Combines backend regex text searches, lead status category filters, and source categorizations alongside customizable sorting directions (`latest` vs `oldest`).
- **⏱️ Client-Side Debounced Input Hook**: Custom hook throttles live search input changes (300ms delay) to keep MongoDB queries light and avoid database performance drops.
- **📊 Offset Pagination Metadata**: Backend limits data queries, returning paginated items along with structured navigational state (`hasNextPage`, `hasPrevPage`, `totalPages`).
- **📥 Streaming CSV Exporter**: Generates a standard-compliant, escaped CSV stream of active filtered leads directly from the database, ignoring page limit boundaries.

---

## 🛠️ Technical Stack Specifications

| Layer | Component | Technical Selection | Implementation Context |
|-------|-----------|---------------------|------------------------|
| **Frontend** | Single Page Client | React 18, TypeScript, Vite, Tailwind CSS | Modular SPA architecture, custom react-hooks, lucide icon library. |
| **Backend** | API Server | Node.js, Express, TypeScript, ts-node-dev | MVC pattern with strict controller isolation and unified error handlers. |
| **Database** | Database Engine | MongoDB, Mongoose ORM | Indexed collections, relational population, structured page-queries. |
| **Security** | Integrity Middleware | BcryptJS, Helmet, CORS | Salted password hashing, secure HTTP headers, whitelist routing. |
| **Validation** | Runtime Verification | Zod Schema Validation | Strict request body contract validation before router execution. |
| **Containers** | Infrastructure | Docker, Docker Compose, Nginx | Multi-stage Nginx containerization for frontend static bundle delivery. |

---

## 📂 Project Directory Structure

```text
d:/smart-leads-crm/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB database connection client
│   │   ├── controllers/     # Controller handlers (Authentication, Leads CRUD)
│   │   ├── middlewares/     # Auth checks, RBAC verification, Zod parsing
│   │   ├── models/          # Mongoose collection schemas (User, Lead)
│   │   ├── routes/          # Express route declarations
│   │   ├── validators/      # Schemas for runtime request checking
│   │   └── server.ts        # Express main entry server
│   ├── tsconfig.json        # Strict TypeScript compiler options
│   ├── Dockerfile           # Backend container instructions
│   └── .env.example         # Template configuration env variables
├── frontend/
│   ├── src/
│   │   ├── components/      # Badges, custom dropdowns, edit modals, skeletons
│   │   ├── context/         # AuthContext state, Dark/Light ThemeContext
│   │   ├── hooks/           # useDebounce hooks
│   │   ├── pages/           # Pages (Login, Register, Main Dashboard)
│   │   ├── services/        # Axios wrapper with header interceptors
│   │   ├── index.css        # Core custom styles, theme variables, scrollbars
│   │   ├── App.tsx          # Client route definitions & guards
│   │   └── main.tsx         # React app bootstrap mount
│   ├── tailwind.config.js   # Custom theme extension styles
│   ├── nginx.conf           # Fallback configs to support HTML5 History routing
│   ├── Dockerfile           # Multi-stage production Nginx dockerfile
│   └── .env.example         # Frontend API configuration variable
├── docker-compose.yml       # Stack manager orchestrator
├── README.md                # System documentation
└── .gitignore               # Ignored version records
```

---

## 📡 RESTful API Documentation

All request URLs must be prefixed with `/api`. Protected endpoints require a valid token header: `Authorization: Bearer <JWT_TOKEN>`.

### 1. Authentication Endpoints

#### `POST /auth/register`
- **Description**: Registers a new system account.
- **Request Body**:
  ```json
  {
    "name": "Rahul Kumar",
    "email": "rahul@workspace.com",
    "password": "securepassword",
    "role": "Sales User" // "Admin" or "Sales User" (default)
  }
  ```
- **Response (201)**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "data": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": { "id": "60d21b4f...", "name": "Rahul Kumar", "email": "rahul@workspace.com", "role": "Sales User" }
    }
  }
  ```

#### `POST /auth/login`
- **Description**: Checks credentials and returns JWT bearer token.
- **Request Body**:
  ```json
  {
    "email": "rahul@workspace.com",
    "password": "securepassword"
  }
  ```
- **Response (200)**: Structurally identical to registration return.

---

### 2. Leads Management Endpoints

#### `GET /leads` (Protected)
- **Description**: Fetches paginated leads matching filter parameters.
- **Query Parameters**:
  - `page`: active page index (default: `1`)
  - `limit`: items per query size (default: `10`)
  - `search`: filters leads by name or email (regex, case-insensitive)
  - `status`: filters by status category (`'New' | 'Contacted' | 'Qualified' | 'Lost'`)
  - `source`: filters by source category (`'Website' | 'Instagram' | 'Referral'`)
  - `sort`: date sort criteria (`'latest'` or `'oldest'`)

#### `POST /leads` (Protected)
- **Description**: Creates a new Lead record.
- **Request Body**:
  ```json
  {
    "name": "Sanya Sen",
    "email": "sanya@workspace.com",
    "status": "New", // optional
    "source": "Website"
  }
  ```

#### `PUT /leads/:id` (Protected)
- **Description**: Updates an existing lead record by ID. Supports partial body updates.

#### `DELETE /leads/:id` (Protected, Enforces Admin RBAC)
- **Description**: Deletes a lead record from MongoDB. Returns `403 Forbidden` if triggered by a user with role `'Sales User'`.

#### `GET /leads/export/csv` (Protected)
- **Description**: Compiles filtered leads directly into an escaped, downloadable CSV stream.

---

## ⚡ Quick Start & Setup

### Option A: Local Dev Manual Run (Recommended for testing)

#### 1. Start MongoDB
Ensure you have MongoDB running locally on: `mongodb://127.0.0.1:27017/smart_leads`.

#### 2. Start Backend Server
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

#### 3. Start Frontend Client
```bash
cd ../frontend
cp .env.example .env
npm install
npm run dev
```
Access the client dashboard at: **`http://localhost:5173`**.

---

### Option B: Docker Compose Orchestration
Construct your local docker environment by running the compose file in the root folder:
```bash
docker-compose up --build
```
This initializes the orchestrated multi-container pipeline:
1. **Database Container**: MongoDB running on port `27017`
2. **API Server Container**: Express API served on `http://localhost:5000`
3. **Client Container**: React app served behind Nginx reverse proxy on port `80`

Access the live container application in your browser at: **`http://localhost`**.

---

## 🧪 Evaluation Guidelines & Test Scenario

To verify the robust implementation of our **Role-Based Access Control** (RBAC) and dashboard interfaces, run this simple evaluation script:

### Step 1: Evaluate Sales User Restrictions
1. Open the signup page and register an account under the **Sales User** role.
2. Log in with the newly registered Sales account.
3. Add a few mock leads (e.g. status: `New`, source: `Website`).
4. **Observe RBAC Lockouts**: Note that the Trash/Delete icon is greyed out. Hover over the icon to see a Padlock tooltip: *"Role restricted. Requires Admin permissions."* Attempting to force delete via backend API directly will return a `403 Forbidden` status.

### Step 2: Evaluate Admin Permissions
1. Log out of the Sales representative account.
2. Register a new account under the **Admin** role.
3. Log in with your new Admin account.
4. **Observe Admin Controls**: Note that the Delete button next to all leads is now active.
5. Delete a lead record. Observe the confirmation warning modal appear. Confirm to see the lead instantly removed with animated list feedback.
6. Customize the search and dropdown filters, and click **Export CSV** to download the clean comma-separated leads file instantly.
